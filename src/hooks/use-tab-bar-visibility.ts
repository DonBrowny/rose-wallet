import { usePathname } from 'expo-router'

export const hiddenRoutes = ['/add-expense', '/patterns', '/settings/about']

export function useTabBarVisibility() {
  const pathname = usePathname()
  const shouldHideTabBar = hiddenRoutes.includes(pathname)
  return {
    shouldHideTabBar,
  }
}
