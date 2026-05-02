'use client'

import { useEffect, useState } from 'react'
import styles from './ThemeToggle.module.css'

type ThemeMode = 'light' | 'dark'

function LightModeIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6.76 4.84 4.96 3.05 3.55 4.46l1.79 1.79 1.42-1.41ZM1 13h3v-2H1v2Zm10-12v3h2V1h-2Zm8.04 2.05-1.79 1.8 1.41 1.41 1.8-1.79-1.42-1.42ZM17.24 19.16l1.8 1.79 1.41-1.41-1.79-1.8-1.42 1.42ZM20 11v2h3v-2h-3Zm-9 9v3h2v-3h-2Zm-7.45-.46 1.41 1.41 1.8-1.79-1.42-1.42-1.79 1.8ZM12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
    </svg>
  )
}

function DarkModeIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3c-1.42 0-2.76.33-3.95.91a1 1 0 0 0-.29 1.6A7.5 7.5 0 0 1 18.5 16.24a1 1 0 0 0 1.6.29A9 9 0 0 0 12 3Zm0 16a7 7 0 0 1-6.93-8.03 9.52 9.52 0 0 0 7.96 7.96A6.9 6.9 0 0 1 12 19Z" />
    </svg>
  )
}

function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredTheme(): ThemeMode | null {
  try {
    const storedTheme = window.localStorage.getItem('theme-mode')
    return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : null
  } catch {
    return null
  }
}

function applyTheme(theme: ThemeMode | null) {
  if (theme) {
    document.documentElement.dataset.theme = theme
  } else {
    delete document.documentElement.dataset.theme
  }
}

export default function ThemeToggle() {
  const [resolvedTheme, setResolvedTheme] = useState<ThemeMode | null>(null)

  useEffect(() => {
    const storedTheme = getStoredTheme()
    setResolvedTheme(storedTheme ?? getSystemTheme())
    applyTheme(storedTheme)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = () => {
      if (!getStoredTheme()) {
        setResolvedTheme(getSystemTheme())
        applyTheme(null)
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [])

  function toggleTheme() {
    const currentTheme = resolvedTheme ?? getSystemTheme()
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark'

    try {
      window.localStorage.setItem('theme-mode', nextTheme)
    } catch {
      // Ignore unavailable localStorage and still update the visible theme.
    }

    setResolvedTheme(nextTheme)
    applyTheme(nextTheme)
  }

  const currentTheme = resolvedTheme ?? 'light'
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark'

  const Icon = currentTheme === 'dark' ? DarkModeIcon : LightModeIcon

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
    >
      <Icon className={styles.icon} />
    </button>
  )
}
