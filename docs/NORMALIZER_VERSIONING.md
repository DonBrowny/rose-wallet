# Normalizer Versioning & Pattern Recompute

**Status:** not implemented — this document is the implementation spec.
**Prerequisite reading:** none beyond the file pointers below; this doc is self-contained.

## Problem

`normalizeSMSTemplate()` output is not just an in-memory value — it is persisted as the
**identity** of every pattern:

- `src/utils/pattern/normalize-sms-template.ts` — the normalizer and the exported
  `NORMALIZER_VERSION` constant (currently `2`; nothing reads it yet).
- `src/services/database/patterns-repository.ts` → `upsertPatternsByGrouping()` — a pattern
  row's `name` is `murmurHash32(groupingTemplate)`. Upserts conflict-resolve on `name`.
- `src/utils/mmkv/pattern-samples.ts` — review samples are stored in MMKV **keyed by that
  same name hash**.
- `src/services/sms-parsing/sms-sync-service.ts` — every sync normalizes incoming SMS with
  the _current_ code and compares against stored `groupingPattern` strings via Dice
  similarity ≥ 0.8 (`matchPattern`), for both active (extract) and rejected (suppress) patterns.

Consequently, any change to the normalization rules makes newly normalized strings diverge
from what is stored. Observed failure modes:

1. **Duplicate patterns** — same SMS format hashes to a new `name`, so discovery inserts a
   fresh row instead of updating the existing one. Old approved/needs-review rows are orphaned.
2. **Rejected patterns resurface** — suppression relies on the stored rejected
   `groupingPattern` still Dice-matching newly normalized messages. Large rule changes break
   this (the bug class fixed in PR #46).
3. **Orphaned MMKV samples** — samples keyed under the old hash are unreachable from the
   new row.

The v1 → v2 bump (whole-digit-run amounts, wrapped `RX_NUM` alternation so dates/bare numbers
get `<DATE>`/`<NUM>`, `VPA` added to PROTECTED) shipped during closed beta on a
**clean-state basis**: users clear app data via the in-app option. That is not acceptable
after launch. This spec adds the machinery so future bumps (e.g. new placeholders such as a
transaction-type tag) are safe, versioned migrations.

## Design

### 1. Schema — already shipped, verify only

`patterns.normalizerVersion` already exists: `integer('normalizer_version').notNull().default(1)`,
added by `src/drizzle/0004_sticky_cammi.sql`. **Do not add it again and do not change the
default.** The default stays `1` deliberately — once stamp-on-write (§2) is in place every
insert supplies the value explicitly, so the default only ever applies to legacy rows, where
`1` ("oldest known format") is exactly right.

### 2. Stamp on write — confirmed missing, and live today

Every write of `groupingPattern` also writes `normalizerVersion: NORMALIZER_VERSION`.
The only writer (verified by grep — everything else matching `groupingPattern:` is an
in-memory type) is `upsertPatternsByGrouping()` in
`src/services/database/patterns-repository.ts`, and today it sets `normalizerVersion`
**nowhere**: not in the insert values and not in the `onConflictDoUpdate` set. Fix both
(the conflict set via `sql`excluded.normalizer_version``).

`extractionPattern` writes (`updatePatternTemplateByName`) do **not** restamp — extraction
templates are built from raw SMS bodies and are independent of the normalizer.

**Consequence of the gap — plan for it, don't discover it:** every existing row, including
rows freshly produced by the current v2 normalizer, is sitting at the DB default of `1`.
So on the first startup after this ships, `min(normalizer_version) < NORMALIZER_VERSION`
is true for the whole table and the recompute sweeps **every** row, not just genuinely
stale ones. For current-format rows with samples this is a harmless no-op: re-normalize
gives the same string, same hash, the no-collision path rewrites identical values and
restamps. The one non-obvious interaction is a current-format `needs-review` row whose
MMKV samples are gone: the no-samples rule below deletes it even though its
`groupingPattern` was never stale. That is accepted behavior (see §3 step 2 rationale),
but it must be a deliberate test case, not an accident.

### 3. Recompute on upgrade

Hook: register a `Migration` in the existing app-migration framework
(`src/services/migrations/index.ts` → `appMigrations`, run by `runMigrations()` from
`src/app/_layout.tsx` right after Drizzle's `useMigrations` succeeds — so the `patterns`
table is guaranteed to exist).

**The framework needs one widening first.** `Migration.shouldRun` is typed
`() => boolean` and the runner filters synchronously
(`migrations.filter((m) => m.shouldRun())` in `migration-runner.ts`). This migration's
trigger is a DB query (`SELECT min(normalizer_version) FROM patterns` <
`NORMALIZER_VERSION`), which is async. Decision: widen the type to
`shouldRun: () => boolean | Promise<boolean>` and replace the runner's `filter` with a
sequential for-loop that awaits each check. This keeps the run/skip decision in the one
place that owns it: the runner's `pending` list — and therefore its empty-list early
return — stays truthful, and the existing synchronous migration
(`sms-encryption-migration`) satisfies the widened type unchanged. (The runner does no
logging today; if telemetry is ever added, this is also where it would hang.) Do **not**
take the "always return true, check inside run()" shortcut: every launch would then
"run" this migration even when it internally no-ops, so the runner could never again
distinguish nothing-to-do from work-done.

The version check itself makes the routine idempotent — no separate "has run" flag
needed, and a crash midway resumes correctly because already-updated rows are stamped.
For this guard to hold, **every swept row must end the sweep stamped** — including the
rows the routine chooses not to recompute (see step 2). A row left unstamped would
re-trigger the sweep on every launch forever.

Algorithm, inside one transaction, for each row with `normalizerVersion < NORMALIZER_VERSION`:

1. **Load source bodies**: MMKV samples via `getPatternSamplesByName(row.name)` — each
   sample carries the original SMS `body`.
2. **No samples available** (MMKV wiped, or legacy rows on the first post-ship sweep):
   - `needs-review` rows: delete (and their `patternSmsGroup` rows first — FK). Without
     samples they are un-reviewable dead weight, and the residual SMS queue self-heals:
     the next discovery run recreates the pattern with fresh samples from queued messages.
   - approved/rejected rows: keep `name`/`groupingPattern` as-is, **stamp them current**,
     and log a warning with the pattern id. Stamping without recompute is deliberate:
     leaving them unstamped buys nothing (there is no future event that restores samples —
     re-approval only writes `extractionPattern`, which per §2 does not restamp) and would
     break the idempotency guard above. Their Dice matching either still works or the
     pattern is effectively dead; the log line is the audit trail either way.
3. **Re-normalize** each sample body with the current `normalizeSMSTemplate`; take the
   majority string (samples of one pattern should agree; if they tie, take the first).
4. `newName = murmurHash32(newTemplate)`.
5. **No collision** (no other row named `newName`): update the row's `name`,
   `groupingPattern`, `normalizerVersion`, `updatedAt`; move MMKV samples from the old key
   to `newName` (write new key, delete old).
6. **Collision** (another row already has `newName` — two old formats now normalize
   identically): merge into the surviving row:
   - Status: if statuses differ, keep the row with the **latest `updatedAt`** (most recent
     user decision wins — matters when approved and rejected collide); log the conflict.
   - `usageCount`: sum. `createdAt`: earliest.
   - MMKV samples: union, capped at 3 (`SAMPLES_PER_PATTERN` in
     `pattern-discovery-service.ts`), keyed under `newName`; delete both old keys.
   - `patternSmsGroup` rows (check the FK — it references pattern **id**, so renames are
     free; merges must repoint the losing pattern's rows to the surviving id, then dedupe).
   - Delete the losing row.
7. Stamp `normalizerVersion = NORMALIZER_VERSION` on the surviving row.

### 4. Non-goals

- Changing normalization rules themselves.
- Re-normalizing the residual SMS queue (`smsMessages`) — queue rows store raw bodies and
  are re-normalized on every sync already.
- Any UI. This is silent startup work; at most a log line with counts.

## Tests

**Harness decision.** The repo convention is _not_ in-memory SQLite — existing repository
specs (`patterns-repository.spec.ts`) hand-mock `getDrizzleDb()`'s chained calls, and no
`:memory:` usage exists anywhere. That convention does not survive contact with this
routine: it is transactional and multi-table (select/update/delete across `patterns` +
`patternSmsGroup`, plus MMKV moves), and mocking every chain would test the mock, not the
merge logic. Use a real in-memory database for this one spec file:

- Write `recomputeStaleGroupingPatterns(db, ...)` to **accept the Drizzle handle as a
  parameter** (production passes `getDrizzleDb()`); the spec injects its own.
- Back the spec with drizzle over **`@libsql/client`** (`:memory:`) as a devDependency,
  applying the SQL files from `src/drizzle/` to create the schema.
- **Do not use `better-sqlite3`**: its Drizzle driver requires _synchronous_ transaction
  callbacks, and this codebase writes async ones against the expo driver
  (`db.transaction(async (tx) => …)`, see `sms-encryption-migration.ts`) — the routine
  would need two incompatible shapes. libsql's driver is async like expo's.
- MMKV samples: mock `@/utils/mmkv/pattern-samples` with `jest.mock`, per existing
  convention.

Cases:

1. Stale row + samples → renamed, restamped, MMKV re-keyed; a subsequent discovery run
   upserts into the same row (no duplicate).
2. Two stale rows whose samples now normalize identically → merged; latest-`updatedAt`
   status survives; usage summed; one MMKV key with ≤ 3 samples; losing row's
   `patternSmsGroup` rows repointed to the survivor and deduped.
3. Approved-vs-rejected collision → latest decision wins, warning logged.
4. Stale `needs-review` row without samples → deleted (with its `patternSmsGroup` rows);
   approved row without samples → data untouched, **stamped current**, warning logged.
5. **First-run sweep (the stamping-gap case from §2):** a row whose `groupingPattern` is
   already in current format but whose `normalizerVersion` is at the default `1` —
   with samples → no-op restamp, same name, same hash; without samples and `needs-review`
   → deleted. This encodes the accepted consequence deliberately.
6. Routine is a no-op when all rows are current (and safe to run twice — after one sweep,
   `shouldRun` must return false).
7. Fixture realism: build "old" rows by hand-writing v1-style strings (e.g.
   `<CUR><AMT>00.00` truncation artifacts) so the test does not depend on old code.

## Acceptance criteria

- [ ] `upsertPatternsByGrouping` stamps `normalizerVersion` on insert **and** in its
      `onConflictDoUpdate` set (the column itself already exists — do not re-add it).
- [ ] `Migration.shouldRun` widened to `boolean | Promise<boolean>`; runner awaits checks
      sequentially; existing sync migration unchanged.
- [ ] Startup recompute runs only when stale rows exist; idempotent (every swept row ends
      stamped, including sample-less approved/rejected rows); single transaction.
- [ ] Renames preserve MMKV samples and `patternSmsGroup` links; merges repoint and dedupe
      the losing row's links; deletes remove them.
- [ ] Collisions merge with latest-decision-wins status policy, logged.
- [ ] First-run sweep behavior (whole table at default `1`) covered by an explicit test.
- [ ] All tests above pass; `pnpm test`, `pnpm type-check`, `pnpm lint` clean.
- [ ] A future `NORMALIZER_VERSION` bump requires **no data clearing** — verify by bumping
      the constant in a test and asserting stored patterns keep matching after recompute.
