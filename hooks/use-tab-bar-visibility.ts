import { usePathname } from 'expo-router'

const hiddenRoutes = ['/patterns', '/settings/about', '/settings/patterns']

export function useTabBarVisibility() {
  const pathname = usePathname()
  const shouldHideTabBar = hiddenRoutes.includes(pathname)
  return {
    shouldHideTabBar,
  }
}
