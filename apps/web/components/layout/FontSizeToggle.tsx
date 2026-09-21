'use client'

import { useEffect, useState } from 'react'

type FontSize = 'small' | 'medium' | 'large'

const STORAGE_KEY = 'vms-font-size'

const OPTIONS: { size: FontSize; label: string; textSize: string }[] = [
  { size: 'small', label: 'Aa', textSize: 'text-xs' },
  { size: 'medium', label: 'Aa', textSize: 'text-sm' },
  { size: 'large', label: 'Aa', textSize: 'text-base' },
]

export default function FontSizeToggle() {
  const [active, setActive] = useState<FontSize>('small')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as FontSize | null
    if (stored) setActive(stored)
  }, [])

  const applyFontSize = (size: FontSize) => {
    setActive(size)
    localStorage.setItem(STORAGE_KEY, size)
    if (size === 'small') {
      document.documentElement.removeAttribute('data-font-size')
    } else {
      document.documentElement.setAttribute('data-font-size', size)
    }
  }

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1" title="Text size">
      {OPTIONS.map((opt) => (
        <button
          key={opt.size}
          onClick={() => applyFontSize(opt.size)}
          className={`px-2 py-1 rounded-md font-semibold transition-colors ${opt.textSize} ${
            active === opt.size
              ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          aria-label={`${opt.size} text size`}
          aria-pressed={active === opt.size}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
