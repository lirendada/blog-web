import { auth } from '@/../auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      tags: {
        include: { tag: { select: { id: true, name: true, slug: true } } },
      },
    },
  })

  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })
  }

  return NextResponse.json({
    ...article,
    tags: article.tags.map((at) => at.tag),
  })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const existing = await prisma.article.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, content, excerpt, coverImage, status, categoryId, slug, tags } = body

    // If slug is being changed, check uniqueness
    if (slug && slug !== existing.slug) {
      const slugConflict = await prisma.article.findUnique({ where: { slug } })
      if (slugConflict) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
      }
    }

    // Determine if we should set publishedAt
    const isPublishing = status === 'published' && existing.status !== 'published'

    const article = await prisma.article.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(excerpt !== undefined && { excerpt: excerpt || null }),
        ...(coverImage !== undefined && { coverImage: coverImage || null }),
        ...(status !== undefined && { status }),
        ...(slug !== undefined && { slug }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(isPublishing && { publishedAt: new Date() }),
      },
    })

    // Handle tags: delete existing and recreate
    if (tags !== undefined) {
      await prisma.articleTag.deleteMany({ where: { articleId: id } })

      if (Array.isArray(tags) && tags.length > 0) {
        for (const tagName of tags) {
          const trimmed = typeof tagName === 'string' ? tagName.trim() : ''
          if (!trimmed) continue

          const tag = await prisma.tag.upsert({
            where: { name: trimmed },
            update: {},
            create: {
              name: trimmed,
              slug: trimmed.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '') || `tag-${Date.now()}`,
            },
          })

          await prisma.articleTag.create({
            data: {
              articleId: article.id,
              tagId: tag.id,
            },
          })
        }
      }
    }

    // Return updated article with relations
    const result = await prisma.article.findUnique({
      where: { id: article.id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        tags: {
          include: { tag: { select: { id: true, name: true, slug: true } } },
        },
      },
    })

    revalidatePath('/')
    revalidatePath('/articles')
    revalidatePath('/tags')
    revalidatePath('/sitemap.xml')
    if (existing.slug) {
      revalidatePath(`/articles/${existing.slug}`)
    }
    if (slug && slug !== existing.slug) {
      revalidatePath(`/articles/${slug}`)
    }

    return NextResponse.json({
      ...result,
      tags: result!.tags.map((at) => at.tag),
    })
  } catch (error) {
    console.error('Failed to update article:', error)
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const existing = await prisma.article.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    await prisma.article.delete({ where: { id } })

    revalidatePath('/')
    revalidatePath('/articles')
    revalidatePath('/tags')
    revalidatePath('/sitemap.xml')
    if (existing.slug) {
      revalidatePath(`/articles/${existing.slug}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete article:', error)
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}
