export function sanitizeText(input: string): string {
  let text = input.trim()
  // Strip HTML tags
  text = text.replace(/<[^>]*>/g, '')
  // Remove control characters (keep newlines and tabs)
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  // Collapse consecutive newlines to max 2
  text = text.replace(/\n{3,}/g, '\n\n')
  return text
}

export function sanitizeAuthor(input: string): string {
  let text = input.trim()
  // Strip HTML tags
  text = text.replace(/<[^>]*>/g, '')
  // Remove control characters
  text = text.replace(/[\x00-\x1F\x7F]/g, '')
  // Limit length
  return text.slice(0, 50)
}
