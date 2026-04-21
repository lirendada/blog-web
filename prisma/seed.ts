import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, role: 'admin' },
  })

  const category = await prisma.category.upsert({
    where: { slug: 'uncategorized' },
    update: {},
    create: { name: '未分类', slug: 'uncategorized', type: 'blog' },
  })

  const tag = await prisma.tag.upsert({
    where: { slug: 'hello' },
    update: {},
    create: { name: 'Hello', slug: 'hello' },
  })

  const article = await prisma.article.upsert({
    where: { slug: 'hello-world' },
    update: {},
    create: {
      title: 'Hello World',
      slug: 'hello-world',
      content: `# Hello World

这是我的第一篇博客文章。欢迎来到 **my_blog**！

## 关于这个博客

这是一个使用 Next.js 构建的个人博客，采用日系手帐风格设计。

- 温暖的米白色背景
- 清爽的鼠尾草绿点缀
- 打字机风格的装饰字体

\`\`\`typescript
const greeting = "Hello, World!"
console.log(greeting)
\`\`\`

> 像在精致的日本手帐本上写字。

感谢你的阅读！`,
      excerpt: '这是我的第一篇博客文章，欢迎来到 my_blog！',
      status: 'published',
      publishedAt: new Date(),
      categoryId: category.id,
    },
  })

  await prisma.articleTag.upsert({
    where: { articleId_tagId: { articleId: article.id, tagId: tag.id } },
    update: {},
    create: { articleId: article.id, tagId: tag.id },
  })

  console.log(`Seeded: user=${user.email}, category=${category.name}, article=${article.slug}`)

  // Seed about page config
  const aboutConfigs = [
    {
      key: 'about_bio',
      value: `你好，欢迎来到我的博客。

我是一名热爱技术和创作的开发者。在这里记录技术思考与生活点滴，用爱发电。

> 写字、编码、用爱发电。`,
    },
    {
      key: 'about_skills',
      value: JSON.stringify(['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS']),
    },
    {
      key: 'about_contact',
      value: JSON.stringify([
        { name: 'GitHub', url: 'https://github.com' },
        { name: 'Email', url: 'mailto:hello@example.com' },
      ]),
    },
    {
      key: 'about_blog',
      value: `这是一个使用 **Next.js** 构建的个人博客，采用日系手帐风格设计。

- 温暖的米白色背景
- 清爽的鼠尾草绿点缀
- 打字机风格的装饰字体
- Markdown 写作，代码高亮

感谢你的阅读！`,
    },
  ]

  for (const config of aboutConfigs) {
    await prisma.siteConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    })
  }

  console.log('Seeded: about page config')

  // Seed default RSS sources — 中文 AI 资讯专用
  const rssSources = [
    // 纯 AI 媒体（内容全相关）
    { name: '机器之心', feedUrl: 'https://www.jiqizhixin.com/rss', siteUrl: 'https://www.jiqizhixin.com' },
    { name: '量子位', feedUrl: 'https://www.qbitai.com/feed', siteUrl: 'https://www.qbitai.com' },
    // 科技综合站（配合 AI 关键词过滤）
    { name: '36氪', feedUrl: 'https://36kr.com/feed', siteUrl: 'https://36kr.com' },
    { name: 'IT之家', feedUrl: 'https://www.ithome.com/rss/', siteUrl: 'https://www.ithome.com' },
    { name: '极客公园', feedUrl: 'https://www.geekpark.net/rss', siteUrl: 'https://www.geekpark.net' },
    { name: 'InfoQ', feedUrl: 'https://www.infoq.cn/feed', siteUrl: 'https://www.infoq.cn' },
    { name: '少数派', feedUrl: 'https://sspai.com/feed', siteUrl: 'https://sspai.com' },
    // RSSHub 路由（AI 专题）
    { name: '掘金 AI', feedUrl: 'https://rsshub.app/juejin/tag/AI', siteUrl: 'https://juejin.cn' },
    { name: '知乎 AI 热门', feedUrl: 'https://rsshub.app/zhihu/topic/19551275', siteUrl: 'https://www.zhihu.com' },
    { name: 'V2EX 技术', feedUrl: 'https://rsshub.app/v2ex/topics/tech', siteUrl: 'https://www.v2ex.com' },
  ]

  for (const source of rssSources) {
    await prisma.newsSource.upsert({
      where: { feedUrl: source.feedUrl },
      update: {},
      create: source,
    })
  }

  console.log('Seeded: RSS sources')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
