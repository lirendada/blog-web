export function generateSlug(title: string): string {
  const hasChinese = /[一-鿿]/.test(title)
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
  const chineseChars = (content.match(/[一-鿿]/g) || []).length
  const englishWords = content.replace(/[一-鿿]/g, '').split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(chineseChars / 500 + englishWords / 200))
  return `${minutes} 分钟`
}

export function getDateKey(date: Date | null): string {
  if (!date) return 'unknown'
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatDateHeader(date: Date): string {
  const d = new Date(date)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekDay = weekDays[d.getDay()]
  return `${month}月${day}日 · ${weekDay}`
}
