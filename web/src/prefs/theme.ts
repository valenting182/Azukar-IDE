import { ref } from 'vue'

import { readLocal, writeLocal } from '@/lib/storage'

import type { AppTheme } from './types'
import { THEME_KEY } from './types'

export const themeRef = ref<AppTheme>('dark')

export function readStoredTheme(): AppTheme | null {
  const value = readLocal(THEME_KEY)
  return value === 'light' || value === 'dark' ? value : null
}

export function resolveTheme(): AppTheme {
  return 'dark'
}

export function applyTheme(_theme: AppTheme = 'dark'): void {
  document.documentElement.classList.add('dark')
  themeRef.value = 'dark'
}

export function writeTheme(theme: AppTheme): void {
  writeLocal(THEME_KEY, theme)
}

export function beginThemeTransition(): void {
  const root = document.documentElement
  root.classList.add('theme-transition')
  window.setTimeout(() => {
    root.classList.remove('theme-transition')
  }, 280)
}

export function setThemePreference(theme: AppTheme): void {
  writeTheme(theme)
  applyTheme(theme)
}

export function initTheme(): AppTheme {
  const theme = resolveTheme()
  applyTheme(theme)
  return theme
}
