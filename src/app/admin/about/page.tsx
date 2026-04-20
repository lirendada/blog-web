'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

type ContactItem = {
  name: string
  url: string
}

type Configs = {
  about_bio: string
  about_skills: string
  about_contact: string
  about_blog: string
}

const defaultConfigs: Configs = {
  about_bio: '',
  about_skills: '[]',
  about_contact: '[]',
  about_blog: '',
}

function parseSkills(json: string): string[] {
  try {
    return JSON.parse(json)
  } catch {
    return []
  }
}

function parseContacts(json: string): ContactItem[] {
  try {
    return JSON.parse(json)
  } catch {
    return []
  }
}

export default function AdminAboutPage() {
  const [configs, setConfigs] = useState<Configs>(defaultConfigs)
  const [skills, setSkills] = useState<string[]>([])
  const [contacts, setContacts] = useState<ContactItem[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewBio, setPreviewBio] = useState('')
  const [previewBlog, setPreviewBlog] = useState('')
  const debounceBioRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const debounceBlogRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch('/api/admin/site-config')
      .then((res) => res.json())
      .then((data) => {
        const loaded = { ...defaultConfigs, ...data.configs }
        setConfigs(loaded)
        setSkills(parseSkills(loaded.about_skills))
        setContacts(parseContacts(loaded.about_contact))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const fetchPreview = useCallback(async (markdown: string) => {
    try {
      const res = await fetch('/api/admin/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: markdown }),
      })
      const data = await res.json()
      return data.html || ''
    } catch {
      return ''
    }
  }, [])

  useEffect(() => {
    if (debounceBioRef.current) clearTimeout(debounceBioRef.current)
    debounceBioRef.current = setTimeout(async () => {
      const html = await fetchPreview(configs.about_bio)
      setPreviewBio(html)
    }, 500)
    return () => { if (debounceBioRef.current) clearTimeout(debounceBioRef.current) }
  }, [configs.about_bio, fetchPreview])

  useEffect(() => {
    if (debounceBlogRef.current) clearTimeout(debounceBlogRef.current)
    debounceBlogRef.current = setTimeout(async () => {
      const html = await fetchPreview(configs.about_blog)
      setPreviewBlog(html)
    }, 500)
    return () => { if (debounceBlogRef.current) clearTimeout(debounceBlogRef.current) }
  }, [configs.about_blog, fetchPreview])

  const handleAddSkill = () => {
    const trimmed = skillInput.trim()
    if (trimmed && !skills.includes(trimmed)) {
      const next = [...skills, trimmed]
      setSkills(next)
      setConfigs((c) => ({ ...c, about_skills: JSON.stringify(next) }))
    }
    setSkillInput('')
  }

  const handleRemoveSkill = (skill: string) => {
    const next = skills.filter((s) => s !== skill)
    setSkills(next)
    setConfigs((c) => ({ ...c, about_skills: JSON.stringify(next) }))
  }

  const handleAddContact = () => {
    const next = [...contacts, { name: '', url: '' }]
    setContacts(next)
    setConfigs((c) => ({ ...c, about_contact: JSON.stringify(next) }))
  }

  const handleUpdateContact = (index: number, field: 'name' | 'url', value: string) => {
    const next = contacts.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    setContacts(next)
    setConfigs((c) => ({ ...c, about_contact: JSON.stringify(next) }))
  }

  const handleRemoveContact = (index: number) => {
    const next = contacts.filter((_, i) => i !== index)
    setContacts(next)
    setConfigs((c) => ({ ...c, about_contact: JSON.stringify(next) }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Save failed')
        return
      }
      setSuccess('Saved successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px-64px)]">
        <p className="font-[family-name:var(--font-mono)] text-sm text-text-secondary dark:text-dark-text-secondary">
          Loading...
        </p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl text-text dark:text-dark-text">
          关于页面
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-accent hover:bg-accent-hover dark:bg-dark-accent dark:hover:bg-dark-accent-hover text-white font-[family-name:var(--font-mono)] text-sm px-5 py-1.5 rounded-[var(--radius-md)] transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2 bg-rose-light dark:bg-dark-rose-light text-rose dark:text-dark-rose font-[family-name:var(--font-mono)] text-sm rounded-[var(--radius-sm)]">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 px-4 py-2 bg-accent-light dark:bg-dark-accent-light text-accent dark:text-dark-accent font-[family-name:var(--font-mono)] text-sm rounded-[var(--radius-sm)]">
          {success}
        </div>
      )}

      {/* 个人简介 */}
      <section className="mb-8">
        <h2 className="font-[family-name:var(--font-heading)] text-lg text-text dark:text-dark-text mb-3">
          个人简介
        </h2>
        <div className="flex gap-4 border border-dashed border-border-light dark:border-dark-border-light rounded-[var(--radius-md)] overflow-hidden">
          <div className="flex-1 min-w-0 border-r border-dashed border-border-light dark:border-dark-border-light">
            <MonacoEditor
              height="200px"
              language="markdown"
              theme="notebook"
              value={configs.about_bio}
              onChange={(v) => setConfigs((c) => ({ ...c, about_bio: v || '' }))}
              options={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 13,
                minimap: { enabled: false },
                lineNumbers: 'on',
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                padding: { top: 12 },
                renderLineHighlight: 'none',
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
              }}
              beforeMount={(monaco) => {
                monaco.editor.defineTheme('notebook', {
                  base: 'vs',
                  inherit: true,
                  rules: [],
                  colors: {
                    'editor.background': '#fdfcfa',
                    'editor.foreground': '#4a4540',
                    'editor.lineHighlightBackground': '#f1eee8',
                    'editorLineNumber.foreground': '#8a8580',
                    'editor.selectionBackground': '#e8ede5',
                    'editorCursor.foreground': '#7d9070',
                  },
                })
              }}
            />
          </div>
          <div className="flex-1 min-w-0 overflow-y-auto p-4 bg-bg dark:bg-dark-bg">
            {previewBio ? (
              <div className="article-content text-sm" dangerouslySetInnerHTML={{ __html: previewBio }} />
            ) : (
              <p className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary">
                Preview...
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 技能/兴趣标签 */}
      <section className="mb-8">
        <h2 className="font-[family-name:var(--font-heading)] text-lg text-text dark:text-dark-text mb-3">
          技能 / 兴趣
        </h2>
        <div className="border border-dashed border-border-light dark:border-dark-border-light rounded-[var(--radius-md)] p-4 bg-bg-card dark:bg-dark-bg-card">
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 bg-accent-light dark:bg-dark-accent-light text-accent dark:text-dark-accent font-[family-name:var(--font-mono)] text-xs px-2.5 py-1 rounded-[var(--radius-full)]"
              >
                {skill}
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-rose dark:hover:text-dark-rose transition-colors cursor-pointer"
                >
                  x
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill() } }}
              placeholder="Add skill..."
              className="flex-1 bg-transparent border-0 border-b border-dashed border-border-light dark:border-dark-border-light focus:border-accent dark:focus:border-dark-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-1 px-1 text-text dark:text-dark-text placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary transition-colors"
            />
            <button
              onClick={handleAddSkill}
              className="font-[family-name:var(--font-mono)] text-xs text-accent dark:text-dark-accent hover:text-accent-hover dark:hover:text-dark-accent-hover py-1 px-3 border border-dashed border-accent dark:border-dark-accent rounded-[var(--radius-sm)] transition-colors cursor-pointer"
            >
              + Add
            </button>
          </div>
        </div>
      </section>

      {/* 联系方式 */}
      <section className="mb-8">
        <h2 className="font-[family-name:var(--font-heading)] text-lg text-text dark:text-dark-text mb-3">
          联系方式
        </h2>
        <div className="border border-dashed border-border-light dark:border-dark-border-light rounded-[var(--radius-md)] p-4 bg-bg-card dark:bg-dark-bg-card">
          {contacts.map((contact, i) => (
            <div key={i} className="flex items-center gap-3 mb-2">
              <input
                type="text"
                value={contact.name}
                onChange={(e) => handleUpdateContact(i, 'name', e.target.value)}
                placeholder="Name (e.g. GitHub)"
                className="w-32 bg-transparent border-0 border-b border-dashed border-border-light dark:border-dark-border-light focus:border-accent dark:focus:border-dark-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-1 px-1 text-text dark:text-dark-text placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary transition-colors"
              />
              <input
                type="text"
                value={contact.url}
                onChange={(e) => handleUpdateContact(i, 'url', e.target.value)}
                placeholder="URL"
                className="flex-1 bg-transparent border-0 border-b border-dashed border-border-light dark:border-dark-border-light focus:border-accent dark:focus:border-dark-accent focus:outline-none font-[family-name:var(--font-mono)] text-sm py-1 px-1 text-text dark:text-dark-text placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary transition-colors"
              />
              <button
                onClick={() => handleRemoveContact(i)}
                className="text-rose dark:text-dark-rose font-[family-name:var(--font-mono)] text-xs hover:opacity-70 transition-opacity cursor-pointer"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={handleAddContact}
            className="font-[family-name:var(--font-mono)] text-xs text-accent dark:text-dark-accent hover:text-accent-hover dark:hover:text-dark-accent-hover py-1 px-3 border border-dashed border-accent dark:border-dark-accent rounded-[var(--radius-sm)] transition-colors cursor-pointer mt-2"
          >
            + Add Contact
          </button>
        </div>
      </section>

      {/* 关于博客 */}
      <section className="mb-8">
        <h2 className="font-[family-name:var(--font-heading)] text-lg text-text dark:text-dark-text mb-3">
          关于博客
        </h2>
        <div className="flex gap-4 border border-dashed border-border-light dark:border-dark-border-light rounded-[var(--radius-md)] overflow-hidden">
          <div className="flex-1 min-w-0 border-r border-dashed border-border-light dark:border-dark-border-light">
            <MonacoEditor
              height="200px"
              language="markdown"
              theme="notebook"
              value={configs.about_blog}
              onChange={(v) => setConfigs((c) => ({ ...c, about_blog: v || '' }))}
              options={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 13,
                minimap: { enabled: false },
                lineNumbers: 'on',
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                padding: { top: 12 },
                renderLineHighlight: 'none',
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
              }}
              beforeMount={(monaco) => {
                monaco.editor.defineTheme('notebook', {
                  base: 'vs',
                  inherit: true,
                  rules: [],
                  colors: {
                    'editor.background': '#fdfcfa',
                    'editor.foreground': '#4a4540',
                    'editor.lineHighlightBackground': '#f1eee8',
                    'editorLineNumber.foreground': '#8a8580',
                    'editor.selectionBackground': '#e8ede5',
                    'editorCursor.foreground': '#7d9070',
                  },
                })
              }}
            />
          </div>
          <div className="flex-1 min-w-0 overflow-y-auto p-4 bg-bg dark:bg-dark-bg">
            {previewBlog ? (
              <div className="article-content text-sm" dangerouslySetInnerHTML={{ __html: previewBlog }} />
            ) : (
              <p className="font-[family-name:var(--font-mono)] text-xs text-text-secondary dark:text-dark-text-secondary">
                Preview...
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
