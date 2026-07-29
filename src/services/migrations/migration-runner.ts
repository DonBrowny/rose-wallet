export interface Migration {
  id: string
  name: string
  shouldRun: () => boolean | Promise<boolean>
  run: () => Promise<void>
}

export interface MigrationRunnerResult {
  success: boolean
  error?: string
}

export async function runMigrations(migrations: Migration[]): Promise<MigrationRunnerResult> {
  const pending: Migration[] = []
  for (const migration of migrations) {
    if (await migration.shouldRun()) {
      pending.push(migration)
    }
  }

  if (pending.length === 0) {
    return { success: true }
  }

  for (const migration of pending) {
    try {
      await migration.run()
    } catch (error) {
      return {
        success: false,
        error: `${migration.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  return { success: true }
}
