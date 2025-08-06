// src/components/ThemeSwitcher.tsx
'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

export const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // useEffect only runs on the client, so we can safely show the UI
  // This avoids a hydration mismatch error
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <button
      aria-label="Toggle Dark Mode"
      type="button"
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? (
        // Moon Icon for Dark Mode
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-yellow-400">
          <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.981A10.503 10.503 0 0112 22.5a10.5 10.5 0 01-10.5-10.5c0-4.308 2.54-8.024 6.242-9.668a.75.75 0 01.819.162z" clipRule="evenodd" />
        </svg>
      ) : (
        // Sun Icon for Light Mode
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-orange-500">
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.106a.75.75 0 011.06.044l1.591 1.59a.75.75 0 01-1.06 1.06l-1.59-1.591a.75.75 0 01-.044-1.06zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.849 17.849a.75.75 0 01-1.06-1.06l1.59-1.591a.75.75 0 111.06 1.06l-1.59 1.59zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.849a.75.75 0 01-1.06 1.06l-1.59-1.59a.75.75 0 011.06-1.061l1.59 1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.106 6.106a.75.75 0 01.044-1.06l1.59-1.591a.75.75 0 011.06 1.06l-1.59 1.59a.75.75 0 01-1.06-.044z" />
        </svg>
      )}
    </button>
  )
}