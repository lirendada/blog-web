import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'

function rehypeLazyImages() {
  return (tree: any) => {
    visit(tree, 'element', (node: any) => {
      if (node.tagName === 'img') {
        node.properties = node.properties || {}
        node.properties.loading = 'lazy'
      }
    })
  }
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypePrettyCode, {
      theme: {
        light: 'vitesse-light',
        dark: 'vitesse-dark',
      },
      keepBackground: false,
      defaultLang: 'plaintext',
    })
    .use(rehypeLazyImages)
    .use(rehypeStringify)
    .process(markdown)
  return file.toString()
}
