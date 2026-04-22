'use client'

import { useEffect, useState } from 'react'

interface TocItem {
  id: string
  text: string
  level: number
}

function extractHeadings(html: string): TocItem[] {
  const headings: TocItem[] = []
  const regex = /<(h[23])\s*>([^<]*)<\/(h[23])>/g
  const idCount = new Map<string, number>()
  let match: RegExpExecArray | null

  while ((match = regex.exec(html)) !== null) {
    const level = match[1] === 'h2' ? 2 : 3
    const text = match[2].trim()
    const baseId = text
      .toLowerCase()
      .replace(/[^a-z0-9一-鿿]+/g, '-')
      .replace(/^-|-$/g, '')
    const count = idCount.get(baseId) ?? 0
    idCount.set(baseId, count + 1)
    const id = count > 0 ? `${baseId}-${count}` : baseId
    headings.push({ id, text, level })
  }

  return headings
}

interface TableOfContentsProps {
  html: string
}

export default function TableOfContents({ html }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  const headings = extractHeadings(html)

  useEffect(() => {
    if (headings.length === 0) return

    // Inject ids into headings in the DOM
    const contentEl = document.querySelector('.article-content')
    if (!contentEl) return

    const headingElements = contentEl.querySelectorAll('h2, h3')
    const idMap = new Map<string, string>()
    headings.forEach((h, i) => {
      idMap.set(h.text, h.id)
      if (headingElements[i]) {
        headingElements[i].id = h.id
      }
    })

    // IntersectionObserver to track active heading
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    )

    headingElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav className="max-h-[calc(100vh-5rem)] overflow-y-auto">
      <h4
        className="
          font-mono text-xs uppercase tracking-wider
          text-text-secondary dark:text-dark-text-secondary
          mb-3
        "
      >
        目录
      </h4>
      <ul className="space-y-3">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault()
                const el = document.getElementById(h.id)
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
              className={`
                block text-sm leading-snug transition-colors duration-150
                ${h.level === 3 ? 'pl-4' : ''}
                ${
                  activeId === h.id
                    ? 'text-accent dark:text-dark-accent font-medium'
                    : 'text-text-secondary dark:text-dark-text-secondary hover:text-text dark:hover:text-dark-text'
                }
              `}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
