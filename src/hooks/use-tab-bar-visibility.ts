import { usePathname } from 'expo-router'

const hiddenRoutes = ['/(shared)/add-expense', '/(shared)/patterns', '/(tabs)/settings/about']

export function useTabBarVisibility() {
  const pathname = usePathname()
  const shouldHideTabBar = hiddenRoutes.includes(pathname)
  return {
    shouldHideTabBar,
  }
}
