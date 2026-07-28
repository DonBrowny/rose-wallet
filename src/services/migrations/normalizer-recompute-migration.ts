import * as schema from '@/db/schema'
import { PATTERN_STATUS, patterns, patternSmsGroup, type Pattern } from '@/db/schema'
import { getDrizzleDb } from '@/services/database/db'
import { SAMPLES_PER_PATTERN } from '@/types/constants'
import { murmurHash32 } from '@/utils/hash/murmur32'
import {
  deletePatternSamplesByName,
  getPatternSamplesByName,
  setPatternSamplesByName,
} from '@/utils/mmkv/pattern-samples'
import { groupByTemplate } from '@/utils/pattern/group-by-template'
import { NORMALIZER_VERSION, normalizeSMSTemplate } from '@/utils/pattern/normalize-sms-template'
import { eq, inArray, lt } from 'drizzle-orm'
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core'
import type { Migration } from './migration-runner'

/** Loose enough to accept both the production expo-sqlite instance and an injected test driver. */
export type RecomputeCapableDb = BaseSQLiteDatabase<'sync' | 'async', any, typeof schema>

export interface RecomputeSummary {
  /** Rows whose name/groupingPattern were (re)computed in place — includes no-op restamps. */
  recomputed: number
  merged: number
  deleted: number
  stampedOnly: number
}

/**
 * Tracks, per current grouping-pattern name, which row now owns it and the ORIGINAL
 * status/usageCount/createdAt/updatedAt it carried before this sweep touched anything.
 * Collision tie-breaks always compare these original values, never a timestamp this
 * sweep just wrote — otherwise whichever stale row happens to be processed first would
 * always look "more recently decided" than one processed later, purely from sweep
 * ordering, and could silently overturn a genuinely later user decision on the other row.
 */
interface SurvivorState {
  id: number
  status: Pattern['status']
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

function toSurvivorState(row: Pattern): SurvivorState {
  return {
    id: row.id,
    status: row.status,
    usageCount: row.usageCount,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

/** Null when every body normalizes to '' (corrupt/empty MMKV entries) — nothing usable to recompute from. */
function pickMajorityTemplate(bodies: string[]): string | null {
  const groups = groupByTemplate(
    bodies.map((body) => ({ body })),
    (item) => normalizeSMSTemplate(item.body)
  )
  if (groups.length === 0) return null
  const [winner] = [...groups].sort((a, b) => b.items.length - a.items.length)
  return winner.groupingPattern
}

/**
 * Recomputes grouping patterns for rows stamped with a stale normalizerVersion, so a
 * normalizer rule change never orphans patterns, MMKV samples, or resurfaces rejected
 * SMS. See docs/NORMALIZER_VERSIONING.md for the full algorithm and rationale.
 */
export async function recomputeStaleGroupingPatterns(db: RecomputeCapableDb): Promise<RecomputeSummary> {
  const summary: RecomputeSummary = { recomputed: 0, merged: 0, deleted: 0, stampedOnly: 0 }

  const allRows: Pattern[] = await db.select().from(patterns)
  const staleRows = allRows.filter((row) => row.normalizerVersion < NORMALIZER_VERSION)
  if (staleRows.length === 0) return summary

  const survivorByName = new Map<string, SurvivorState>(allRows.map((row) => [row.name, toSurvivorState(row)]))

  // Note: drizzle-orm's expo-sqlite driver commits as soon as this callback's first
  // `await` yields, so this provides no real rollback-on-error atomicity in production
  // (same limitation sms-encryption-migration.ts already has). Correctness instead
  // relies on every row below being processed idempotently, so a crash mid-sweep is
  // safe to resume — never on the SQL transaction undoing a partial sweep.
  await db.transaction(async (tx) => {
    for (const row of staleRows) {
      const samples = getPatternSamplesByName(row.name)
      const newTemplate = samples.length > 0 ? pickMajorityTemplate(samples.map((s) => s.body)) : null

      if (!newTemplate) {
        // Either no samples, or every sample body normalized to '' (corrupt/empty
        // entries) — nothing usable to recompute from either way.
        if (row.status === PATTERN_STATUS.NeedsReview) {
          await tx.delete(patternSmsGroup).where(eq(patternSmsGroup.patternId, row.id))
          await tx.delete(patterns).where(eq(patterns.id, row.id))
          summary.deleted += 1
        } else {
          await tx.update(patterns).set({ normalizerVersion: NORMALIZER_VERSION }).where(eq(patterns.id, row.id))
          console.warn(
            `normalizer-recompute: pattern ${row.id} (${row.status}) has no usable samples — stamped without recompute`
          )
          summary.stampedOnly += 1
        }
        continue
      }

      const newName = murmurHash32(newTemplate)
      const existing = survivorByName.get(newName)

      if (!existing || existing.id === row.id) {
        // Rename in place — a no-op restamp when newName already equals row.name.
        await tx
          .update(patterns)
          .set({
            name: newName,
            groupingPattern: newTemplate,
            normalizerVersion: NORMALIZER_VERSION,
            updatedAt: new Date(),
          })
          .where(eq(patterns.id, row.id))

        if (newName !== row.name) {
          setPatternSamplesByName(newName, samples.slice(0, SAMPLES_PER_PATTERN))
          deletePatternSamplesByName(row.name)
          survivorByName.delete(row.name)
        }

        // Only seed from this row's own pre-sweep snapshot when nobody occupied
        // newName yet. When existing.id === row.id, `existing` may already carry
        // state folded in from an earlier collision this sweep (row can be a merge
        // survivor and still show up here later, e.g. an already-current-format row
        // that's stale only from the pre-fix stamping gap) — resetting it to row's
        // original snapshot would silently drop that earlier merge's contribution.
        if (!existing) {
          survivorByName.set(newName, toSurvivorState(row))
        }

        summary.recomputed += 1
        continue
      }

      // Collision — two formats now normalize identically. Merge `row` into `existing`.
      const rowIsNewer = row.updatedAt.getTime() > existing.updatedAt.getTime()
      const mergedStatus = rowIsNewer ? row.status : existing.status
      const mergedUsageCount = existing.usageCount + row.usageCount
      const mergedCreatedAt =
        row.createdAt.getTime() < existing.createdAt.getTime() ? row.createdAt : existing.createdAt
      const mergedOriginalUpdatedAt = rowIsNewer ? row.updatedAt : existing.updatedAt

      await tx
        .update(patterns)
        .set({
          status: mergedStatus,
          usageCount: mergedUsageCount,
          createdAt: mergedCreatedAt,
          updatedAt: new Date(),
          normalizerVersion: NORMALIZER_VERSION,
        })
        .where(eq(patterns.id, existing.id))

      await tx.update(patternSmsGroup).set({ patternId: existing.id }).where(eq(patternSmsGroup.patternId, row.id))

      // The losing row's links now point at the survivor too — dedupe (patternId, smsId).
      const links = await tx.select().from(patternSmsGroup).where(eq(patternSmsGroup.patternId, existing.id))
      const seenSmsIds = new Set<number>()
      const duplicateLinkIds: number[] = []
      for (const link of [...links].sort((a, b) => a.id - b.id)) {
        if (seenSmsIds.has(link.smsId)) duplicateLinkIds.push(link.id)
        else seenSmsIds.add(link.smsId)
      }
      if (duplicateLinkIds.length > 0) {
        await tx.delete(patternSmsGroup).where(inArray(patternSmsGroup.id, duplicateLinkIds))
      }

      await tx.delete(patterns).where(eq(patterns.id, row.id))

      // MMKV last: if a crash lands between the SQL above and here, the loser row is
      // already gone from the table, so it can't be reprocessed — but it also can't
      // be stranded as a duplicate. Doing this before the SQL (as an earlier version
      // did) let a crash leave the loser stamped-current-but-unmerged forever, since
      // the no-samples branch above would find its key already moved and never retry.
      const survivorSamples = getPatternSamplesByName(newName)
      const seenSampleSmsIds = new Set<number>()
      const unionedSamples = [...survivorSamples, ...samples]
        .filter((sample) => {
          if (seenSampleSmsIds.has(sample.smsId)) return false
          seenSampleSmsIds.add(sample.smsId)
          return true
        })
        .slice(0, SAMPLES_PER_PATTERN)
      setPatternSamplesByName(newName, unionedSamples)
      if (row.name !== newName) deletePatternSamplesByName(row.name)

      survivorByName.set(newName, {
        id: existing.id,
        status: mergedStatus,
        usageCount: mergedUsageCount,
        createdAt: mergedCreatedAt,
        updatedAt: mergedOriginalUpdatedAt,
      })
      summary.merged += 1
      console.warn(`normalizer-recompute: merged pattern ${row.id} into ${existing.id} (status=${mergedStatus})`)
    }
  })

  return summary
}

async function hasStaleGroupingPatterns(db: RecomputeCapableDb): Promise<boolean> {
  const stale = await db
    .select({ id: patterns.id })
    .from(patterns)
    .where(lt(patterns.normalizerVersion, NORMALIZER_VERSION))
    .limit(1)
  return stale.length > 0
}

export const normalizerRecomputeMigration: Migration = {
  id: 'normalizer-recompute',
  name: 'Normalizer grouping pattern recompute',
  shouldRun: () => hasStaleGroupingPatterns(getDrizzleDb()),
  run: async () => {
    const summary = await recomputeStaleGroupingPatterns(getDrizzleDb())
    console.warn(
      `normalizer-recompute: recomputed=${summary.recomputed} merged=${summary.merged} deleted=${summary.deleted} stampedOnly=${summary.stampedOnly}`
    )
  },
}
