import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import FloatingActions from '@/components/ui/FloatingActions'
import Footer from '@/components/layout/Footer'
import { cookies } from 'next/headers'

const zenMaruGothic = localFont({
  src: [
    { path: '../../public/fonts/zen-maru-gothic-400.woff2', weight: '400' },
    { path: '../../public/fonts/zen-maru-gothic-500.woff2', weight: '500' },
    { path: '../../public/fonts/zen-maru-gothic-700.woff2', weight: '700' },
  ],
  variable: '--font-heading',
  display: 'swap',
})

const notoSansSC = localFont({
  src: [
    { path: '../../public/fonts/noto-sans-sc-400.woff2', weight: '400' },
    { path: '../../public/fonts/noto-sans-sc-500.woff2', weight: '500' },
    { path: '../../public/fonts/noto-sans-sc-700.woff2', weight: '700' },
  ],
  variable: '--font-body',
  display: 'swap',
})

const courierPrime = localFont({
  src: [
    { path: '../../public/fonts/courier-prime-400.woff2', weight: '400' },
    { path: '../../public/fonts/courier-prime-700.woff2', weight: '700' },
  ],
  variable: '--font-mono',
  display: 'swap',
})

const jetbrainsMono = localFont({
  src: [
    { path: '../../public/fonts/jetbrains-mono-400.woff2', weight: '400' },
    { path: '../../public/fonts/jetbrains-mono-500.woff2', weight: '500' },
    { path: '../../public/fonts/jetbrains-mono-700.woff2', weight: '700' },
  ],
  variable: '--font-code',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s | my_blog',
    default: 'my_blog',
  },
  description: '一个日系手帐风格的个人博客，记录技术思考与生活点滴',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: siteUrl,
    siteName: 'my_blog',
    title: 'my_blog',
    description: '一个日系手帐风格的个人博客，记录技术思考与生活点滴',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'my_blog',
    description: '一个日系手帐风格的个人博客，记录技术思考与生活点滴',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const darkMode = cookieStore.get('darkMode')?.value === 'true'
  const className = [
    zenMaruGothic.variable,
    notoSansSC.variable,
    courierPrime.variable,
    jetbrainsMono.variable,
    darkMode ? 'dark' : '',
  ].join(' ')

  return (
    <html lang="zh-CN" className={className} suppressHydrationWarning>
      <body className="bg-bg text-text min-h-screen flex flex-col font-[family-name:var(--font-body)]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingActions />
      </body>
    </html>
  )
}
