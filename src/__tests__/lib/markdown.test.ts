import { describe, it, expect } from 'vitest'
import { markdownToHtml } from '@/lib/markdown'

describe('markdownToHtml', () => {
  it('converts h1 heading', async () => {
    const result = await markdownToHtml('# Hello World')
    expect(result).toContain('<h1>')
    expect(result).toContain('Hello World')
    expect(result).toContain('</h1>')
  })

  it('converts h2 heading', async () => {
    const result = await markdownToHtml('## Section Title')
    expect(result).toContain('<h2>')
    expect(result).toContain('Section Title')
    expect(result).toContain('</h2>')
  })

  it('converts bold text', async () => {
    const result = await markdownToHtml('This is **bold** text')
    expect(result).toContain('<strong>bold</strong>')
  })

  it('converts italic text', async () => {
    const result = await markdownToHtml('This is *italic* text')
    expect(result).toContain('<em>italic</em>')
  })

  it('converts links', async () => {
    const result = await markdownToHtml('[Click here](https://example.com)')
    expect(result).toContain('<a href="https://example.com">')
    expect(result).toContain('Click here')
  })

  it('converts code blocks', async () => {
    const result = await markdownToHtml('```\nconst x = 1\n```')
    expect(result).toContain('<pre><code>')
    expect(result).toContain('const x = 1')
  })

  it('converts inline code', async () => {
    const result = await markdownToHtml('Use `npm install` to install')
    expect(result).toContain('<code>npm install</code>')
  })

  it('converts blockquotes', async () => {
    const result = await markdownToHtml('> This is a quote')
    expect(result).toContain('<blockquote>')
    expect(result).toContain('This is a quote')
  })

  it('handles Chinese text', async () => {
    const result = await markdownToHtml('# 中文标题')
    expect(result).toContain('<h1>')
    expect(result).toContain('中文标题')
  })

  it('converts images', async () => {
    const result = await markdownToHtml('![Alt text](https://example.com/image.png)')
    expect(result).toContain('<img src="https://example.com/image.png" alt="Alt text"')
  })

  it('converts unordered lists', async () => {
    const result = await markdownToHtml('- Item 1\n- Item 2\n- Item 3')
    expect(result).toContain('<ul>')
    expect(result).toContain('<li>')
    expect(result).toContain('Item 1')
    expect(result).toContain('Item 2')
    expect(result).toContain('Item 3')
  })

  it('converts ordered lists', async () => {
    const result = await markdownToHtml('1. First\n2. Second\n3. Third')
    expect(result).toContain('<ol>')
    expect(result).toContain('<li>')
    expect(result).toContain('First')
    expect(result).toContain('Second')
    expect(result).toContain('Third')
  })

  it('returns empty string for empty input', async () => {
    const result = await markdownToHtml('')
    expect(result.trim()).toBe('')
  })
})
