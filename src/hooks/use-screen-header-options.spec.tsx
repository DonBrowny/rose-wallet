import { renderHook } from '@testing-library/react-native'
import { useScreenHeaderOptions } from './use-screen-header-options'

jest.mock('./use-header-options', () => ({
  useHeaderOptions: () => ({ headerStyle: { backgroundColor: '#000' } }),
}))

describe('useScreenHeaderOptions', () => {
  it('returns title and headerLeft by default', () => {
    const { result } = renderHook(() => useScreenHeaderOptions({ title: 'MyTitle' }))
    expect(result.current.headerTitle).toBe('MyTitle')
    expect(typeof result.current.headerLeft).toBe('function')
  })

  it('disables headerLeft when showBackButton=false', () => {
    const { result } = renderHook(() => useScreenHeaderOptions({ title: 'X', showBackButton: false }))
    expect(result.current.headerLeft).toBeUndefined()
  })
})
