import { resetDatabase, getSQLite } from './db'

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
  })),
}))

describe('db', () => {
  describe('resetDatabase', () => {
    it('disables foreign keys, deletes all tables, and re-enables foreign keys', () => {
      const mockExecSync = jest.fn()
      const db = getSQLite()
      ;(db as any).execSync = mockExecSync

      resetDatabase()

      // Should disable foreign keys first
      expect(mockExecSync).toHaveBeenCalledWith('PRAGMA foreign_keys = OFF')

      // Should delete from all schema tables
      expect(mockExecSync).toHaveBeenCalledWith('DELETE FROM sms_messages')
      expect(mockExecSync).toHaveBeenCalledWith('DELETE FROM merchants')
      expect(mockExecSync).toHaveBeenCalledWith('DELETE FROM categories')
      expect(mockExecSync).toHaveBeenCalledWith('DELETE FROM merchant_category_groups')
      expect(mockExecSync).toHaveBeenCalledWith('DELETE FROM transactions')
      expect(mockExecSync).toHaveBeenCalledWith('DELETE FROM patterns')
      expect(mockExecSync).toHaveBeenCalledWith('DELETE FROM pattern_sms_group')

      // Should re-enable foreign keys last
      expect(mockExecSync).toHaveBeenCalledWith('PRAGMA foreign_keys = ON')
    })

    it('calls PRAGMA statements in correct order', () => {
      const mockExecSync = jest.fn()
      const db = getSQLite()
      ;(db as any).execSync = mockExecSync

      resetDatabase()

      const calls = mockExecSync.mock.calls.map((call) => call[0])

      // First call should be disabling foreign keys
      expect(calls[0]).toBe('PRAGMA foreign_keys = OFF')

      // Last call should be enabling foreign keys
      expect(calls[calls.length - 1]).toBe('PRAGMA foreign_keys = ON')
    })
  })
})
