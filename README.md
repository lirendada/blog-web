# my-blog

一个基于 Next.js 的个人博客与资讯聚合站，包含前台阅读、文章管理、评论审核、访问统计和 RSS 资讯抓取等能力。整体视觉采用日系手帐 / 打字机风格。

## 功能概览

- 博客文章：Markdown 写作、标签 / 分类、文章详情、目录、阅读进度、点赞与浏览统计
- 资讯聚合：RSS 源管理、资讯列表、时间筛选、来源统计和关键词概览
- 后台管理：文章、分类、评论、资讯源、站点配置和统计面板
- 站点基础：搜索、深色模式、RSS Feed、Sitemap、Robots、基础 SEO

## 技术栈

- Next.js 15 / React 19 / TypeScript
- Prisma 6 / PostgreSQL
- NextAuth
- Tailwind CSS 4
- Vitest

## 本地启动

```bash
npm install
cp .env.example .env
docker compose up -d postgres
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

启动后访问：

- 前台：http://localhost:3000
- 后台：http://localhost:3000/admin/login

后台账号来自 `.env`：

```env
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="changeme"
```

## 环境变量

参考 `.env.example`：

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/myblog"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="changeme"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

生产环境需要替换数据库地址、站点地址和 `NEXTAUTH_SECRET`。

## 常用命令

```bash
npm run dev          # 本地开发
npm run build        # 生产构建
npm run start        # 启动生产服务
npm run test:run     # 运行测试
npm run db:studio    # 打开 Prisma Studio
npm run db:seed      # 初始化管理员、示例文章和默认 RSS 源
```

## Docker

项目提供了 `docker-compose.yml`，包含应用、PostgreSQL 和 Nginx。开发时通常只需要启动数据库：

```bash
docker compose up -d postgres
```

完整容器启动：

```bash
npm run docker:up
```

## 目录结构

```text
src/app/          Next.js App Router 页面与 API
src/components/   页面组件、后台组件和通用 UI
src/lib/          数据、Markdown、SEO、RSS、统计等工具函数
src/types/        项目类型定义
prisma/           Prisma schema、迁移和 seed
public/           静态资源
```
