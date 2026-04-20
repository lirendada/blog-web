import { describe, it, expect, vi } from 'vitest'
import { generateSlug, formatDate, calculateReadingTime } from '@/lib/utils'

describe('generateSlug', () => {
  it('generates post-{hash} for Chinese title', () => {
    const slug = generateSlug('我的第一篇博客')
    expect(slug).toMatch(/^post-[a-z0-9]+$/)
  })

  it('slugifies English title', () => {
    const slug = generateSlug('Hello World Blog Post')
    expect(slug).toBe('hello-world-blog-post')
  })

  it('handles special characters in English title', () => {
    const slug = generateSlug('Hello, World! & Goodbye...')
    expect(slug).toBe('hello-world-goodbye')
  })

  it('handles mixed Chinese and English as Chinese', () => {
    const slug = generateSlug('使用 Next.js 构建')
    expect(slug).toMatch(/^post-[a-z0-9]+$/)
  })

  it('handles lowercase conversion for English', () => {
    const slug = generateSlug('ALL CAPS TITLE')
    expect(slug).toBe('all-caps-title')
  })

  it('trims leading and trailing hyphens', () => {
    const slug = generateSlug('---hello-world---')
    expect(slug).toBe('hello-world')
  })
})

describe('formatDate', () => {
  it('returns YYYY.MM.DD format', () => {
    const date = new Date('2024-01-15')
    const formatted = formatDate(date)
    expect(formatted).toBe('2024.01.15')
  })

  it('pads single digit month and day', () => {
    const date = new Date('2024-03-05')
    const formatted = formatDate(date)
    expect(formatted).toBe('2024.03.05')
  })

  it('handles end of year date', () => {
    const date = new Date('2024-12-31')
    const formatted = formatDate(date)
    expect(formatted).toBe('2024.12.31')
  })

  it('handles Date object from string', () => {
    const formatted = formatDate(new Date('2023-07-01'))
    expect(formatted).toBe('2023.07.01')
  })
})

describe('calculateReadingTime', () => {
  it('returns minimum 1 minute for short content', () => {
    const result = calculateReadingTime('Short text')
    expect(result).toBe('1 分钟')
  })

  it('calculates Chinese reading time (~500 chars/min)', () => {
    const chineseText = '中'.repeat(500)
    const result = calculateReadingTime(chineseText)
    expect(result).toBe('1 分钟')
  })

  it('calculates 2 minutes for 600 Chinese chars', () => {
    const chineseText = '中'.repeat(600)
    const result = calculateReadingTime(chineseText)
    expect(result).toBe('2 分钟')
  })

  it('calculates English reading time (~200 words/min)', () => {
    const words = Array(200).fill('word').join(' ')
    const result = calculateReadingTime(words)
    expect(result).toBe('1 分钟')
  })

  it('calculates 2 minutes for 300 English words', () => {
    const words = Array(300).fill('word').join(' ')
    const result = calculateReadingTime(words)
    expect(result).toBe('2 分钟')
  })

  it('handles mixed Chinese and English content', () => {
    const chineseChars = '中'.repeat(250)
    const englishWords = Array(100).fill('word').join(' ')
    const result = calculateReadingTime(chineseChars + ' ' + englishWords)
    // 250/500 + 100/200 = 0.5 + 0.5 = 1.0 -> ceil = 1
    expect(result).toBe('1 分钟')
  })

  it('returns minimum 1 minute for empty content', () => {
    const result = calculateReadingTime('')
    expect(result).toBe('1 分钟')
  })
})
