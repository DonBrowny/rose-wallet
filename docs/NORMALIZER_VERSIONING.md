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

### 1. Schema

Add to the `patterns` table in `src/db/schema.ts`:

```
normalizerVersion: integer('normalizer_version').notNull().default(2)
```

Default = the `NORMALIZER_VERSION` live when the column ships. Run `pnpm db:generate` to
produce the Drizzle migration. Follow the repo convention: no enums, plain const maps.

### 2. Stamp on write

Every write of `groupingPattern` also writes `normalizerVersion: NORMALIZER_VERSION`:

- `upsertPatternsByGrouping()` — both the insert values and the `onConflictDoUpdate` set.
- Any other writer of `groupingPattern` (grep before assuming there are none).

`extractionPattern` writes (`updatePatternTemplateByName`) do **not** restamp — extraction
templates are built from raw SMS bodies and are independent of the normalizer.

### 3. Recompute on upgrade

Hook: after Drizzle migrations complete in `src/app/_layout.tsx` (or a service it calls),
run `recomputeStaleGroupingPatterns()` when
`SELECT min(normalizer_version) FROM patterns` < `NORMALIZER_VERSION`. The version check
itself makes the routine idempotent — no separate "has run" flag needed, and a crash midway
resumes correctly because already-updated rows are stamped.

Algorithm, inside one transaction, for each row with `normalizerVersion < NORMALIZER_VERSION`:

1. **Load source bodies**: MMKV samples via `getPatternSamplesByName(row.name)` — each
   sample carries the original SMS `body`.
2. **No samples available** (MMKV wiped, edge case):
   - `needs-review` rows: delete — they are junk without samples and rediscoverable.
   - approved/rejected rows: leave untouched (unstamped), log a warning with the pattern id.
     Dice matching usually still works; the next re-approval restamps naturally.
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

Unit-test the recompute routine directly (repositories mocked or against an in-memory
SQLite as other repo tests do):

1. Stale row + samples → renamed, restamped, MMKV re-keyed; a subsequent discovery run
   upserts into the same row (no duplicate).
2. Two stale rows whose samples now normalize identically → merged; latest-`updatedAt`
   status survives; usage summed; one MMKV key with ≤ 3 samples.
3. Approved-vs-rejected collision → latest decision wins, warning logged.
4. Stale `needs-review` row without samples → deleted; approved row without samples →
   untouched and unstamped.
5. Routine is a no-op when all rows are current (and safe to run twice).
6. Fixture realism: build "old" rows by hand-writing v1-style strings (e.g.
   `<CUR><AMT>00.00` truncation artifacts) so the test does not depend on old code.

## Acceptance criteria

- [ ] `patterns.normalizerVersion` column exists; all `groupingPattern` writers stamp it.
- [ ] Startup recompute runs only when stale rows exist; idempotent; single transaction.
- [ ] Renames preserve MMKV samples and `patternSmsGroup` links.
- [ ] Collisions merge with latest-decision-wins status policy, logged.
- [ ] All tests above pass; `pnpm test`, `pnpm type-check`, `pnpm lint` clean.
- [ ] A future `NORMALIZER_VERSION` bump requires **no data clearing** — verify by bumping
      the constant in a test and asserting stored patterns keep matching after recompute.
