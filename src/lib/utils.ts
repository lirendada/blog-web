export function generateSlug(title: string): string {
  const hasChinese = /[\u4e00-\u9fff]/.test(title)
  if (hasChinese) {
    const timestamp = Date.now().toString(36)
    return `post-${timestamp}`
  }
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function formatDate(date: Date): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

export function calculateReadingTime(content: string): string {
  const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length
  const englishWords = content.replace(/[\u4e00-\u9fff]/g, '').split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(chineseChars / 500 + englishWords / 200))
  return `${minutes} 分钟`
}
