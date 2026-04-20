'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface LikeButtonProps {
  slug: string
  initialCount: number
  initialLiked: boolean
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  life: number
  maxLife: number
}

const COLORS = ['#7d9070', '#c9908e', '#5b6b7a', '#e8c87a', '#9bb5d4', '#f0a868', '#b8d4a8', '#d4a0b8']

function useConfetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const frameRef = useRef<number>(0)

  const spawn = useCallback((originX: number, originY: number) => {
    const batch: Particle[] = []
    for (let i = 0; i < 35; i++) {
      const angle = (Math.PI * 2 * i) / 35 + (Math.random() - 0.5) * 0.5
      const speed = 2 + Math.random() * 4
      batch.push({
        x: originX, y: originY,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 3 + Math.random() * 4,
        life: 0, maxLife: 40 + Math.random() * 30,
      })
    }
    particlesRef.current = [...particlesRef.current, ...batch]
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const alive: Particle[] = []
      for (const p of particlesRef.current) {
        p.life++; p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.vx *= 0.99
        if (p.life >= p.maxLife) continue
        ctx.globalAlpha = 1 - p.life / p.maxLife
        ctx.fillStyle = p.color
        ctx.beginPath()
        if (p.size > 5) { ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size * 0.6) }
        else { ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill() }
        alive.push(p)
      }
      ctx.globalAlpha = 1
      particlesRef.current = alive
      frameRef.current = requestAnimationFrame(animate)
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(frameRef.current) }
  }, [])

  return { canvasRef, spawn }
}

export default function LikeButton({ slug, initialCount, initialLiked }: LikeButtonProps) {
  const [count, setCount] = useState(initialCount)
  const [liked, setLiked] = useState(initialLiked)
  const [loading, setLoading] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { canvasRef, spawn } = useConfetti()

  const handleToggle = async () => {
    if (loading) return
    setLoading(true)

    const newLiked = !liked
    setLiked(newLiked)
    setCount((c) => c + (newLiked ? 1 : -1))

    if (newLiked && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      spawn(rect.left + rect.width / 2, rect.top)
    }

    try {
      const res = await fetch(`/api/articles/${slug}/like`, { method: 'POST' })
      if (!res.ok) {
        setLiked(!newLiked)
        setCount((c) => c + (newLiked ? -1 : 1))
      }
      // On success: keep optimistic state, don't overwrite with server count
    } catch {
      setLiked(!newLiked)
      setCount((c) => c + (newLiked ? -1 : 1))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 z-50 pointer-events-none" aria-hidden="true" />
      <div className="flex items-center justify-center py-8">
        <button
          ref={buttonRef}
          onClick={handleToggle}
          disabled={loading}
          className={`
            group flex items-center gap-2 px-5 py-2.5
            border border-dashed rounded-[var(--radius-md)]
            font-mono text-sm transition-all duration-200 cursor-pointer
            ${liked
              ? 'border-rose dark:border-dark-rose bg-rose-light/50 dark:bg-dark-rose-light/50 text-rose dark:text-dark-rose'
              : 'border-border-light dark:border-dark-border-light text-text-secondary dark:text-dark-text-secondary hover:border-rose dark:hover:border-dark-rose hover:text-rose dark:hover:text-dark-rose'
            }
          `}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${liked ? 'scale-110' : 'group-hover:scale-125'}`}
            fill={liked ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{liked ? '已赞' : '点赞'}</span>
          <span className="text-xs opacity-70">{count}</span>
        </button>
      </div>
    </>
  )
}
