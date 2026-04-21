import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function cleanTitle(title: string): string {
  let t = title

  // Remove ** bold markers ** and everything between consecutive bold segments
  t = t.replace(/\*\*/g, '')

  // Remove Ⅰ. Ⅱ. etc (roman numeral section markers)
  t = t.replace(/^[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]+\.\s*/, '')

  // Remove leading chinese number like 一、二、
  t = t.replace(/^[一二三四五六七八九十]+[、.]\s*/, '')

  // Remove leading "N、" or "N、" pattern (e.g. "1、KMP算法简介" → "KMP算法简介")
  t = t.replace(/^\d+[、.]\s*/, '')

  // Remove leetcode-style prefix like "200. 岛屿数量" → "岛屿数量"
  t = t.replace(/^\d+\.\s+/, '')

  // Remove "① ②" style markers
  t = t.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]+\s*/, '')

  // Remove "==highlight==" markers
  t = t.replace(/==/g, '')

  // Remove leading/trailing whitespace and special chars
  t = t.trim()

  // Remove trailing punctuation that doesn't make sense as a title
  t = t.replace(/[\s:：]+$/, '')

  return t
}

async function fixTitles() {
  const articles = await prisma.article.findMany({
    select: { id: true, title: true },
  })

  let updated = 0

  for (const article of articles) {
    const cleaned = cleanTitle(article.title)
    if (cleaned !== article.title) {
      await prisma.article.update({
        where: { id: article.id },
        data: { title: cleaned || article.title },
      })
      updated++
      console.log(`  "${article.title}" → "${cleaned}"`)
    }
  }

  console.log(`\nUpdated ${updated} / ${articles.length} titles`)
  await prisma.$disconnect()
}

fixTitles().catch((e) => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
