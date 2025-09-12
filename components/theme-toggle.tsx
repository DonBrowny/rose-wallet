import { Toggle } from '@/components/ui/toggle'
import { useTheme } from '@/lib/theme-context'
import { Moon, Sun } from 'lucide-react-native'
import React, { useMemo, useState } from 'react'
import { Icon } from './ui/icon'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { toggleTheme, themeMode, isDark } = useTheme()
  const [pressed, setPressed] = useState(false)
  const ThemeIcon = useMemo(() => {
    if (themeMode === 'light') {
      return Sun
    }
    return Moon
  }, [themeMode])

  const handlePress = () => {
    setPressed(!pressed)
    toggleTheme()
  }

  return (
    <Toggle
      pressed={pressed}
      onPressedChange={setPressed}
      onPress={handlePress}
      variant='outline'
      className={`${className} w-10 h-10 rounded-full bg-card border-2 ${isDark ? 'border-white/30' : 'border-black/30'} shadow-sm`}
    >
      <Icon
        as={ThemeIcon}
        size={18}
        className='text-foreground'
      />
    </Toggle>
  )
}
