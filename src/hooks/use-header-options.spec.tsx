import { renderHook } from '@testing-library/react-native'
import { useHeaderOptions } from './use-header-options'

describe('useHeaderOptions', () => {
  it('returns themed colors and defaults', () => {
    const { result } = renderHook(() => useHeaderOptions())
    expect((result.current.headerStyle as any).backgroundColor).toBe('#FFFFFF')
    expect(result.current.headerTintColor).toBe('#191D21')
    expect(result.current.headerShown).toBe(true)
    expect(result.current.headerTitleAlign).toBe('center')
  })

  it('respects headerShown=false', () => {
    const { result } = renderHook(() => useHeaderOptions(false))
    expect(result.current.headerShown).toBe(false)
  })
})
