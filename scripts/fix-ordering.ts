import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()
const NOTES_DIR = '/Users/Zhuanz/sync/note/notes'

async function fixOrdering() {
  // Build a map: filename → order index within its directory
  const orderMap = new Map<string, number>()

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    const mdFiles = entries.filter(e => e.isFile() && e.name.endsWith('.md'))
                           .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true }))

    mdFiles.forEach((entry, idx) => {
      const fullPath = path.join(dir, entry.name)
      // Use content hash to match — store relative path
      const relPath = path.relative(NOTES_DIR, fullPath)
      orderMap.set(relPath, idx)
    })

    entries.filter(e => e.isDirectory() && e.name !== 'img')
           .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true }))
           .forEach(e => walk(path.join(dir, e.name)))
  }

  walk(NOTES_DIR)

  // Get all articles with their slugs
  const articles = await prisma.article.findMany({
    select: { id: true, slug: true },
  })

  // We need to match slug back to file — since slug was generated from title,
  // we'll instead order by the category + slug pattern.
  // A better approach: group by category, then sort alphabetically within each category

  // Get articles grouped by category
  const categories = await prisma.category.findMany()
  let globalOrder = 0

  // Sort categories in a logical learning order
  const categoryOrder = [
    'C C++', '数据结构', 'shell脚本编程', 'Linux', 'MySQL',
    'Redis', 'ProtoBuf', 'Makefile', 'Git及一些网页部署',
    '刷题本', '优选算法', '项目', '思维导图',
  ]

  const sortedCategories = [...categories].sort((a, b) => {
    const ai = categoryOrder.indexOf(a.name)
    const bi = categoryOrder.indexOf(b.name)
    if (ai === -1 && bi === -1) return a.name.localeCompare(b.name)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

  for (const category of sortedCategories) {
    const categoryArticles = await prisma.article.findMany({
      where: { categoryId: category.id },
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    })

    for (const article of categoryArticles) {
      const baseDate = new Date('2024-01-01T00:00:00Z')
      baseDate.setMinutes(baseDate.getMinutes() + globalOrder)
      await prisma.article.update({
        where: { id: article.id },
        data: { publishedAt: baseDate },
      })
      globalOrder++
    }
    console.log(`${category.name}: ${categoryArticles.length} articles ordered`)
  }

  console.log(`\nTotal: ${globalOrder} articles re-ordered`)
  await prisma.$disconnect()
}

fixOrdering().catch((e) => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
