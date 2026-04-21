'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword.length < 8) {
      setError('新密码至少需要 8 个字符')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '修改失败')
        setLoading(false)
        return
      }

      setSuccess('密码已修改，即将重新登录...')
      setTimeout(() => {
        signOut({ callbackUrl: '/admin/login' })
      }, 1500)
    } catch {
      setError('修改失败，请重试')
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-heading)] text-2xl text-text mb-2">
        设置
      </h1>
      <div className="border-b border-dashed border-border-light mb-8" />

      <div className="max-w-[480px]">
        <h2 className="font-[family-name:var(--font-mono)] text-sm text-text-secondary mb-4">
          修改密码
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-[family-name:var(--font-mono)] text-xs text-text-secondary mb-1">
              当前密码
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full bg-transparent border-0 border-b border-dashed border-border-light focus:border-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-3 px-1 text-text placeholder:text-text-secondary transition-colors"
            />
          </div>

          <div>
            <label className="block font-[family-name:var(--font-mono)] text-xs text-text-secondary mb-1">
              新密码
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              placeholder="至少 8 个字符"
              className="w-full bg-transparent border-0 border-b border-dashed border-border-light focus:border-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-3 px-1 text-text placeholder:text-text-secondary transition-colors"
            />
          </div>

          <div>
            <label className="block font-[family-name:var(--font-mono)] text-xs text-text-secondary mb-1">
              确认新密码
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-transparent border-0 border-b border-dashed border-border-light focus:border-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-3 px-1 text-text placeholder:text-text-secondary transition-colors"
            />
          </div>

          {error && (
            <p className="text-rose text-sm font-[family-name:var(--font-mono)]">{error}</p>
          )}
          {success && (
            <p className="text-accent text-sm font-[family-name:var(--font-mono)]">{success}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-[family-name:var(--font-mono)] text-sm py-2.5 px-6 rounded-[var(--radius-md)] transition-colors cursor-pointer"
          >
            {loading ? '修改中...' : '修改密码'}
          </button>
        </form>
      </div>
    </div>
  )
}
