import { runMigrations, type Migration } from './migration-runner'

function makeMigration(overrides: Partial<Migration>): Migration {
  return {
    id: 'test-migration',
    name: 'Test Migration',
    shouldRun: () => true,
    run: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

describe('runMigrations', () => {
  it('runs a migration whose shouldRun is synchronously true', async () => {
    const run = jest.fn().mockResolvedValue(undefined)
    const migration = makeMigration({ shouldRun: () => true, run })

    const result = await runMigrations([migration])

    expect(result).toEqual({ success: true })
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('skips a migration whose shouldRun is synchronously false', async () => {
    const run = jest.fn().mockResolvedValue(undefined)
    const migration = makeMigration({ shouldRun: () => false, run })

    const result = await runMigrations([migration])

    expect(result).toEqual({ success: true })
    expect(run).not.toHaveBeenCalled()
  })

  it('runs a migration whose shouldRun resolves true asynchronously', async () => {
    const run = jest.fn().mockResolvedValue(undefined)
    const migration = makeMigration({ shouldRun: () => Promise.resolve(true), run })

    const result = await runMigrations([migration])

    expect(result).toEqual({ success: true })
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('skips a migration whose shouldRun resolves false asynchronously', async () => {
    const run = jest.fn().mockResolvedValue(undefined)
    const migration = makeMigration({ shouldRun: () => Promise.resolve(false), run })

    const result = await runMigrations([migration])

    expect(result).toEqual({ success: true })
    expect(run).not.toHaveBeenCalled()
  })

  it('does not call run for any migration when every shouldRun is false', async () => {
    const runA = jest.fn().mockResolvedValue(undefined)
    const runB = jest.fn().mockResolvedValue(undefined)

    const result = await runMigrations([
      makeMigration({ id: 'a', shouldRun: () => false, run: runA }),
      makeMigration({ id: 'b', shouldRun: () => Promise.resolve(false), run: runB }),
    ])

    expect(result).toEqual({ success: true })
    expect(runA).not.toHaveBeenCalled()
    expect(runB).not.toHaveBeenCalled()
  })

  it('runs only the migrations whose shouldRun is true, preserving order', async () => {
    const calls: string[] = []
    const migrations = [
      makeMigration({
        id: 'skip-me',
        shouldRun: () => false,
        run: jest.fn(async () => {
          calls.push('skip-me')
        }),
      }),
      makeMigration({
        id: 'run-me-1',
        shouldRun: () => true,
        run: jest.fn(async () => {
          calls.push('run-me-1')
        }),
      }),
      makeMigration({
        id: 'run-me-2',
        shouldRun: () => Promise.resolve(true),
        run: jest.fn(async () => {
          calls.push('run-me-2')
        }),
      }),
    ]

    const result = await runMigrations(migrations)

    expect(result).toEqual({ success: true })
    expect(calls).toEqual(['run-me-1', 'run-me-2'])
  })

  it('returns a namespaced error and stops when a migration throws', async () => {
    const runA = jest.fn().mockRejectedValue(new Error('boom'))
    const runB = jest.fn().mockResolvedValue(undefined)

    const result = await runMigrations([
      makeMigration({ id: 'a', shouldRun: () => true, run: runA }),
      makeMigration({ id: 'b', shouldRun: () => true, run: runB }),
    ])

    expect(result).toEqual({ success: false, error: 'a: boom' })
    expect(runB).not.toHaveBeenCalled()
  })
})
