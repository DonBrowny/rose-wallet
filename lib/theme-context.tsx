import { useColorScheme } from 'nativewind'
import React, { createContext, ReactNode, useContext, useState } from 'react'
import { Appearance } from 'react-native'
import { MMKV } from 'react-native-mmkv'

interface ThemeContextType {
  toggleTheme: () => void
  themeMode: 'light' | 'dark'
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const storage = new MMKV()
const THEME_KEY = 'theme-preference'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { setColorScheme, toggleColorScheme } = useColorScheme()
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    const savedTheme = storage.getString(THEME_KEY) as 'light' | 'dark'
    if (savedTheme) {
      setColorScheme(savedTheme)
      return savedTheme
    }
    return Appearance.getColorScheme() || 'light'
  })

  const isDark = themeMode === 'dark'

  const toggleTheme = () => {
    let newTheme: 'light' | 'dark'
    if (themeMode === 'light') {
      newTheme = 'dark'
    } else {
      newTheme = 'light'
    }
    toggleColorScheme()
    setThemeMode(newTheme)
    storage.set(THEME_KEY, newTheme)
  }

  return <ThemeContext.Provider value={{ toggleTheme, themeMode, isDark }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
