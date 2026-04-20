'use client'

import { useEffect, useState } from 'react'

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('darkMode')
    const cookieDark = document.cookie
      .split('; ')
      .find((row) => row.startsWith('darkMode='))
      ?.split('=')[1]

    const dark = stored === 'true' || cookieDark === 'true'
    setIsDark(dark)
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', String(next))
    document.cookie = `darkMode=${next};path=/;max-age=31536000;SameSite=Lax`
  }

  return (
    <button
      onClick={toggle}
      className="font-[family-name:var(--font-mono)] text-sm text-text-secondary hover:text-accent transition-colors cursor-pointer"
      aria-label="Toggle dark mode"
    >
      {isDark ? '暗' : '亮'} / {isDark ? '亮' : '暗'}
    </button>
  )
}
