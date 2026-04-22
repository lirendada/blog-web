'use client'

import { useState, useRef, useEffect } from 'react'

const EMOJIS = [
  ['😀', '😂', '🤣', '😊', '😇', '🥰', '😍', '🤩', '😘', '😋'],
  ['🤔', '🤗', '😏', '😌', '😎', '🥳', '😇', '🙃', '😉', '🫡'],
  ['😢', '😭', '😤', '😠', '🤯', '😱', '😰', '😥', '😓', '🥺'],
  ['👍', '👎', '👏', '🙌', '🤝', '💪', '✌️', '🤞', '👋', '🫶'],
  ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💯', '✨'],
  ['🔥', '⭐', '🌟', '💡', '🎉', '🎊', '🎯', '🚀', '📌', '📎'],
  ['👀', '🐱', '🐶', '🐼', '🦊', '🌈', '☁️', '🌙', '☀️', '🍀'],
]

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
}

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="
          text-base leading-none px-1.5 py-0.5
          rounded-[var(--radius-sm)]
          hover:bg-accent/10 dark:hover:bg-dark-accent/10
          transition-colors cursor-pointer
        "
        title="表情"
      >
        😊
      </button>

      {open && (
        <div
          className="
            absolute bottom-full mb-2 left-0 z-50
            p-2
            bg-bg dark:bg-dark-bg
            border border-dashed border-border-light dark:border-dark-border-light
            rounded-[var(--radius-md)]
            shadow-sm
          "
        >
          {EMOJIS.map((row, i) => (
            <div key={i} className="flex">
              {row.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onSelect(emoji)
                    setOpen(false)
                  }}
                  className="
                    w-8 h-8 flex items-center justify-center
                    text-lg leading-none
                    rounded hover:bg-accent/10 dark:hover:bg-dark-accent/10
                    transition-colors cursor-pointer
                  "
                >
                  {emoji}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
