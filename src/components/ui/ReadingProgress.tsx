'use client'

import { useEffect, useState } from 'react'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight > 0) {
        setProgress(scrollTop / docHeight)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (progress <= 0) return null

  return (
    <div
      className="
        fixed top-0 left-0 z-50
        h-[2px] w-full
        bg-transparent
      "
    >
      <div
        className="h-full bg-accent dark:bg-dark-accent transition-[width] duration-150 ease-out"
        style={{ width: `${Math.min(progress * 100, 100)}%` }}
      />
    </div>
  )
}
