'use client'

import { useEffect, useState } from 'react'
import Giscus from '@giscus/react'

export default function Comments() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')

    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO
  if (!repo) return null

  return (
    <div className="mt-12 pt-8 border-t border-dashed border-border-light dark:border-dark-border-light">
      <Giscus
        repo={repo as `${string}/${string}`}
        repoId={process.env.NEXT_PUBLIC_GISCUS_REPO_ID || ''}
        category={process.env.NEXT_PUBLIC_GISCUS_CATEGORY || 'General'}
        categoryId={process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || ''}
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme === 'dark' ? 'dark_tritanopia' : 'light'}
        lang="zh-CN"
        loading="lazy"
      />
    </div>
  )
}
