import { usePathname } from 'expo-router'

const hiddenRoutes = ['/add-expense', ' /patterns', '/settings/about']

export function useTabBarVisibility() {
  const pathname = usePathname()
  const shouldHideTabBar = hiddenRoutes.includes(pathname)
  return {
    shouldHideTabBar,
  }
}
