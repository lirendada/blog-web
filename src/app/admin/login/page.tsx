'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirectTo: '/admin',
      })

      if (result === undefined) {
        // redirectTo causes a full page redirect, result is undefined
        return
      }

      if ((result as { error?: string })?.error) {
        setError('邮箱或密码错误')
        setLoading(false)
      } else {
        router.push('/admin')
      }
    } catch {
      setError('登录失败，请重试')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-[400px] bg-bg-card rounded-[var(--radius-lg)] p-8 bg-lined shadow-md">
        <h1 className="font-[family-name:var(--font-mono)] text-2xl text-text text-center mb-2">
          lirendada的小屋 管理手帐
        </h1>
        <div className="border-b border-dashed border-border-light mb-8" />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email..."
              required
              className="w-full bg-transparent border-0 border-b border-dashed border-border-light focus:border-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-3 px-1 text-text placeholder:text-text-secondary transition-colors"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password..."
              required
              className="w-full bg-transparent border-0 border-b border-dashed border-border-light focus:border-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-3 px-1 text-text placeholder:text-text-secondary transition-colors"
            />
          </div>

          {error && (
            <p className="text-rose text-sm font-[family-name:var(--font-mono)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-[family-name:var(--font-mono)] text-sm py-3 rounded-[var(--radius-md)] transition-colors cursor-pointer"
          >
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>
      </div>
    </div>
  )
}
