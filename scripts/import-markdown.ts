import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()
const NOTES_DIR = '/Users/Zhuanz/sync/note/notes'
const IMG_PREFIX = '/notes-img'

function generateSlug(title: string): string {
  const hasChinese = /[一-鿿]/.test(title)
  if (hasChinese) {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).slice(2, 6)
    return `post-${timestamp}-${random}`
  }
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function extractTitle(filePath: string, content: string): string {
  // Try first heading in content
  const headingMatch = content.match(/^#{1,3}\s+(.+)/m)
  if (headingMatch) {
    return headingMatch[1]
      .replace(/==.*?==/g, '')   // Remove ==highlights==
      .replace(/`[^`]+`/g, '')   // Remove inline code
      .replace(/\[.*?\]\(.*?\)/g, '') // Remove links, keep text
      .trim()
  }
  // Fallback to filename
  return path.basename(filePath, '.md')
    .replace(/^\d+[、.]\s*/, '')  // Remove leading numbers like "1、"
    .trim()
}

function extractExcerpt(content: string, maxLen = 200): string {
  // Remove [TOC], headings, images, code blocks, links
  const cleaned = content
    .replace(/\[TOC\]/gi, '')
    .replace(/^#{1,6}\s+.*/gm, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`>==#|-]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
  return cleaned.slice(0, maxLen) + (cleaned.length > maxLen ? '...' : '')
}

function rewriteImagePaths(content: string, mdFilePath: string): string {
  const mdDir = path.dirname(mdFilePath)

  return content.replace(
    /(!\[[^\]]*\])\(([^)]+)\)/g,
    (match, alt, src) => {
      // Already absolute or external URL
      if (src.startsWith('http') || src.startsWith('/')) return match

      // Resolve relative path to absolute, then make it relative to notes dir
      const absPath = path.resolve(mdDir, decodeURIComponent(src))
      const relToNotes = path.relative(NOTES_DIR, absPath)

      // If it points inside notes/img/, rewrite to /notes-img/
      if (relToNotes.startsWith('img') || relToNotes.startsWith('img/')) {
        const imgName = relToNotes.replace(/^img\/?/, '')
        return `${alt}(${IMG_PREFIX}/${imgName})`
      }

      return match
    }
  )
}

function removeToc(content: string): string {
  return content.replace(/\[TOC\]\s*\n*/gi, '')
}

async function ensureCategory(name: string) {
  return prisma.category.upsert({
    where: { name },
    update: {},
    create: {
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9一-鿿]+/g, '-').replace(/^-|-$/g, '') || `cat-${Date.now()}`,
      type: 'blog',
    },
  })
}

async function ensureTag(name: string) {
  return prisma.tag.upsert({
    where: { name },
    update: {},
    create: {
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9一-鿿]+/g, '-').replace(/^-|-$/g, '') || `tag-${Date.now()}`,
    },
  })
}

async function importMarkdown() {
  const files: string[] = []

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name !== 'img') walk(fullPath)
      } else if (entry.name.endsWith('.md')) {
        files.push(fullPath)
      }
    }
  }

  walk(NOTES_DIR)
  console.log(`Found ${files.length} markdown files\n`)

  let imported = 0
  let skipped = 0

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const content = removeToc(rewriteImagePaths(raw, filePath))

    if (content.trim().length === 0) {
      console.log(`  SKIP (empty): ${path.relative(NOTES_DIR, filePath)}`)
      skipped++
      continue
    }

    const title = extractTitle(filePath, raw)

    // Derive category from top-level directory
    const relPath = path.relative(NOTES_DIR, filePath)
    const parts = relPath.split(path.sep)
    const categoryName = parts[0]

    // Derive tag from second-level directory if exists
    const tagName = parts.length > 2 ? parts[1] : null

    const slug = generateSlug(title)
    const excerpt = extractExcerpt(content)

    // Check slug uniqueness
    const existing = await prisma.article.findUnique({ where: { slug } })
    if (existing) {
      console.log(`  SKIP (duplicate slug): ${title}`)
      skipped++
      continue
    }

    const category = await ensureCategory(categoryName)

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        status: 'published',
        categoryId: category.id,
        publishedAt: new Date(),
      },
    })

    // Attach sub-directory as tag if exists
    if (tagName) {
      const tag = await ensureTag(tagName)
      await prisma.articleTag.create({
        data: { articleId: article.id, tagId: tag.id },
      })
    }

    imported++
    console.log(`  OK: ${categoryName}${tagName ? '/' + tagName : ''} → ${title}`)
  }

  console.log(`\nDone. Imported: ${imported}, Skipped: ${skipped}`)
  await prisma.$disconnect()
}

importMarkdown().catch((e) => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
