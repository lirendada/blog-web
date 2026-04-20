import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { markdownToHtml } from '@/lib/markdown'

export const metadata: Metadata = {
  title: '关于',
  description: '关于这个博客和它的作者。',
}

type ContactItem = {
  name: string
  url: string
}

async function getAboutConfig() {
  const configs = await prisma.siteConfig.findMany({
    where: {
      key: { in: ['about_bio', 'about_skills', 'about_contact', 'about_blog'] },
    },
  })
  const data: Record<string, string> = {}
  for (const c of configs) {
    data[c.key] = c.value
  }
  return data
}

export default async function AboutPage() {
  const config = await getAboutConfig()

  const bioHtml = config.about_bio ? await markdownToHtml(config.about_bio) : ''
  const blogHtml = config.about_blog ? await markdownToHtml(config.about_blog) : ''

  let skills: string[] = []
  try {
    skills = JSON.parse(config.about_skills || '[]')
  } catch { /* empty */ }

  let contacts: ContactItem[] = []
  try {
    contacts = JSON.parse(config.about_contact || '[]')
  } catch { /* empty */ }

  const hasContent = bioHtml || skills.length > 0 || contacts.length > 0 || blogHtml

  return (
    <div className="max-w-[960px] w-full mx-auto px-6">
      <h1
        className="font-heading text-3xl text-text dark:text-dark-text pt-10 pb-6"
      >
        关于
      </h1>

      {!hasContent && (
        <p className="font-mono text-sm text-text-secondary dark:text-dark-text-secondary py-16 text-center">
          暂无内容
        </p>
      )}

      {bioHtml && (
        <section className="mb-8">
          <div className="border-b border-dashed border-border-light dark:border-dark-border-light mb-6" />
          <div className="article-content" dangerouslySetInnerHTML={{ __html: bioHtml }} />
        </section>
      )}

      {skills.length > 0 && (
        <section className="mb-8">
          <div className="border-b border-dashed border-border-light dark:border-dark-border-light mb-6" />
          <h2 className="font-heading text-2xl text-text dark:text-dark-text mb-4">
            技能 / 兴趣
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-block bg-accent-light dark:bg-dark-accent-light text-accent dark:text-dark-accent font-mono text-xs px-3 py-1.5 rounded-[var(--radius-full)]"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {contacts.length > 0 && (
        <section className="mb-8">
          <div className="border-b border-dashed border-border-light dark:border-dark-border-light mb-6" />
          <h2 className="font-heading text-2xl text-text dark:text-dark-text mb-4">
            联系方式
          </h2>
          <div className="flex flex-col gap-2">
            {contacts.map((contact, i) => (
              <a
                key={i}
                href={contact.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-accent dark:text-dark-accent hover:text-accent-hover dark:hover:text-dark-accent-hover transition-colors"
              >
                {contact.name || contact.url}
              </a>
            ))}
          </div>
        </section>
      )}

      {blogHtml && (
        <section className="mb-8">
          <div className="border-b border-dashed border-border-light dark:border-dark-border-light mb-6" />
          <h2 className="font-heading text-2xl text-text dark:text-dark-text mb-4">
            关于博客
          </h2>
          <div className="article-content" dangerouslySetInnerHTML={{ __html: blogHtml }} />
        </section>
      )}
    </div>
  )
}
