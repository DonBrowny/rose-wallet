import { resetApp } from './reset-app-service'
import { resetDatabase } from '@/services/database/db'
import { storage } from '@/utils/mmkv/storage'

jest.mock('@/services/database/db', () => ({
  resetDatabase: jest.fn(),
}))

jest.mock('@/utils/mmkv/storage', () => ({
  storage: {
    clearAll: jest.fn(),
  },
}))

describe('resetApp', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls resetDatabase to clear all tables', () => {
    resetApp()

    expect(resetDatabase).toHaveBeenCalledTimes(1)
  })

  it('calls storage.clearAll to clear MMKV storage', () => {
    resetApp()

    expect(storage.clearAll).toHaveBeenCalledTimes(1)
  })

  it('resets database before clearing storage', () => {
    const callOrder: string[] = []

    ;(resetDatabase as jest.Mock).mockImplementation(() => {
      callOrder.push('resetDatabase')
    })
    ;(storage.clearAll as jest.Mock).mockImplementation(() => {
      callOrder.push('clearAll')
    })

    resetApp()

    expect(callOrder).toEqual(['resetDatabase', 'clearAll'])
  })
})
