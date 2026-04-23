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
  pinned?: boolean
}

function tagColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0
  }
  const palette = [
    'bg-accent-light text-accent dark:bg-dark-accent-light dark:text-dark-accent',
    'bg-rose-light text-rose dark:bg-dark-rose-light dark:text-dark-rose',
    'bg-bg-secondary text-navy dark:bg-dark-bg-secondary dark:text-dark-text',
    'bg-bg-secondary text-mustard dark:bg-dark-bg-secondary dark:text-dark-accent',
  ]
  return palette[Math.abs(hash) % palette.length]
}

export default function StickerCard({ href, title, tilt: tiltProp, hoverTilt: hoverTiltProp, excerpt, tags, pinned = false }: StickerCardProps) {
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
          transition-[transform,box-shadow,border-color] duration-300
          ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
          text-center
        "
        style={{
          '--tilt': `${tilt}deg`,
          '--tilt-hover': `${hoverTilt}deg`,
          transform: `rotate(var(--tilt))`,
        } as React.CSSProperties}
      >
        {pinned && (
          <>
            <div
              className="
                absolute top-[12px] left-[12px]
                w-4 h-4 -translate-x-1/2 -translate-y-1/2
                rounded-full
                bg-bg dark:bg-dark-bg
                shadow-[inset_0_1px_3px_rgba(74,69,64,0.22)]
              "
            />

            <div
              className="
                sticker-pin absolute z-20
                top-[12px] left-[12px]
                -translate-x-1/2 -translate-y-full
                transition-opacity duration-300
                flex flex-col items-center
              "
            >
              <div className="relative h-[18px] w-[18px] rounded-full bg-stamp shadow-md dark:bg-dark-stamp">
                <div className="absolute left-[3px] top-[3px] h-[8px] w-[8px] rounded-full bg-white/30" />
              </div>
              <div className="h-[12px] w-[2px] bg-stamp/80 dark:bg-dark-stamp/80" />
            </div>
          </>
        )}

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
          border-color: color-mix(in srgb, var(--color-accent) 40%, transparent);
        }
        .sticker-card:hover .sticker-pin {
          opacity: 0;
        }
        @media (prefers-reduced-motion: reduce) {
          .sticker-card,
          .sticker-pin {
            transition: none;
          }
          .sticker-card,
          .sticker-card:hover {
            transform: none !important;
          }
        }
      `}</style>
    </Link>
  )
}
