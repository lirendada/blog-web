interface ArticleContentProps {
  html: string
}

export default function ArticleContent({ html }: ArticleContentProps) {
  return (
    <div
      className="article-content max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
