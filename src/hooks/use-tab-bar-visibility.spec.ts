import { renderHook } from '@testing-library/react-native'
import { usePathname } from 'expo-router'
import { useTabBarVisibility } from './use-tab-bar-visibility'

jest.mock('expo-router', () => ({ usePathname: jest.fn() }))

describe('useTabBarVisibility', () => {
  it('hides tab bar for all hidden routes', () => {
    const hiddenRoutes = ['/(shared)/add-expense', '/(shared)/patterns', '/(tabs)/settings/about']
    hiddenRoutes.forEach((route) => {
      ;(usePathname as unknown as jest.Mock).mockReturnValue(route)
      const { result, unmount } = renderHook(() => useTabBarVisibility())
      expect(result.current).toEqual({ shouldHideTabBar: true })
      unmount()
    })
  })

  it('hides tab bar for hidden routes', () => {
    ;(usePathname as unknown as jest.Mock).mockReturnValue('/(shared)/add-expense')
    const { result } = renderHook(() => useTabBarVisibility())
    expect(result.current).toEqual({ shouldHideTabBar: true })
  })

  it('shows tab bar for other routes', () => {
    ;(usePathname as unknown as jest.Mock).mockReturnValue('/home')
    const { result } = renderHook(() => useTabBarVisibility())
    expect(result.current).toEqual({ shouldHideTabBar: false })
  })
})
