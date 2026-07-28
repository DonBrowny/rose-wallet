import { Migration } from './migration-runner'
import { normalizerRecomputeMigration } from './normalizer-recompute-migration'
import { smsEncryptionMigration } from './sms-encryption-migration'

export const appMigrations: Migration[] = [smsEncryptionMigration, normalizerRecomputeMigration]

export { runMigrations } from './migration-runner'
export type { Migration, MigrationRunnerResult } from './migration-runner'
