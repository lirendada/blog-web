'use client'

import Link from 'next/link'

interface StickerTag {
  name: string
  slug: string
}

interface StickerCardProps {
  href: string
  title: string
  tilt?: number
  hoverTilt?: number
  excerpt?: string | null
  tags?: StickerTag[]
}

const TILT_TABLE = [-3, 2, -1, 3, -2, 1, -3, 2]
const HOVER_TILT_TABLE = [1, -2, 2, -1, 1, -2, 1, -1]

function tagColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0
  }
  const palette = [
    'bg-rose-light text-rose dark:bg-dark-rose-light dark:text-dark-rose',
    'bg-accent-light text-accent dark:bg-dark-accent-light dark:text-dark-accent',
    'bg-[#fef3c7] text-mustard dark:bg-[#3a3520] dark:text-mustard',
    'bg-[#e0e7f1] text-navy dark:bg-[#252d3a] dark:text-[#8faabe]',
    'bg-[#f3e8ff] text-[#7c3aed] dark:bg-[#2d1f3d] dark:text-[#b794f4]',
    'bg-[#ecfdf5] text-[#059669] dark:bg-[#1a2d25] dark:text-[#6ee7b7]',
    'bg-[#fff7ed] text-[#c2410c] dark:bg-[#2d2218] dark:text-[#fdba74]',
  ]
  return palette[Math.abs(hash) % palette.length]
}

export default function StickerCard({ href, title, tilt: tiltProp, hoverTilt: hoverTiltProp, excerpt, tags }: StickerCardProps) {
  const tilt = tiltProp ?? 0
  const hoverTilt = hoverTiltProp ?? 0

  return (
    <Link href={href} className="group block">
      <div
        className="
          sticker-card relative p-5
          bg-bg-card dark:bg-dark-bg-card
          border border-dashed border-border-light dark:border-dark-border-light
          rounded-[var(--radius-lg)]
          shadow-sm hover:shadow-md
          transition-[transform,box-shadow] duration-400
          ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
          text-center
        "
        style={{
          '--tilt': `${tilt}deg`,
          '--tilt-hover': `${hoverTilt}deg`,
          transform: `rotate(var(--tilt))`,
        } as React.CSSProperties}
      >
        {/* Hole punch — centered at (12px, 12px) from card corner */}
        <div
          className="
            absolute top-[12px] left-[12px]
            w-4 h-4 -translate-x-1/2 -translate-y-1/2
            rounded-full
            bg-bg dark:bg-dark-bg
            shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]
          "
        />

        {/* Pin — needle tip lands exactly at hole center */}
        <div
          className="
            sticker-pin absolute z-20
            top-[12px] left-[12px]
            -translate-x-1/2 -translate-y-full
            transition-opacity duration-300
            flex flex-col items-center
          "
        >
          <div className="w-[18px] h-[18px] rounded-full bg-gradient-to-br from-[#e06060] to-[#a83838] shadow-md relative">
            <div className="absolute top-[3px] left-[3px] w-[8px] h-[8px] rounded-full bg-white/30" />
          </div>
          <div className="w-[2px] h-[12px] bg-[#b04848]" />
        </div>

        <h3
          className="
            font-heading text-base
            text-text dark:text-dark-text
            group-hover:text-accent dark:group-hover:text-dark-accent
            transition-colors
            line-clamp-2 mb-2
          "
        >
          {title}
        </h3>

        {excerpt && (
          <p
            className="
              font-mono text-xs
              text-text-secondary dark:text-dark-text-secondary
              line-clamp-2 mt-1
            "
          >
            {excerpt}
          </p>
        )}

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center mt-3">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag.slug}
                className={`
                  inline-block px-2 py-0.5
                  rounded-[var(--radius-sm)]
                  font-mono text-[11px]
                  ${tagColor(tag.name)}
                `}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .sticker-card:hover {
          transform: rotate(var(--tilt-hover)) scale(1.04) translateY(-4px) !important;
        }
        .sticker-card:hover .sticker-pin {
          opacity: 0;
        }
      `}</style>
    </Link>
  )
}
