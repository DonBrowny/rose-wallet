import { Migration } from './migration-runner'
import { smsEncryptionMigration } from './sms-encryption-migration'

export const appMigrations: Migration[] = [smsEncryptionMigration]

export { runMigrations } from './migration-runner'
export type { Migration, MigrationRunnerResult } from './migration-runner'
