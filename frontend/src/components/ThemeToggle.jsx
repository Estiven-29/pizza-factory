import React from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle({ isDark, toggleDark }) {
  return (
    <button
      onClick={toggleDark}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle Dark Mode"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}
