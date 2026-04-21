'use client'

import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const CHART_COLORS = ['#7d9070', '#c9908e', '#c4a35a', '#5b6b7a', '#8fa682', '#d4a0a0']

interface StatsData {
  overview: {
    periodViews: number
    totalArticles: number
    totalComments: number
    lifetimeViews: number
    avgViewsPerArticle: number
  }
  viewsByDay: { date: string; views: number }[]
  topArticles: { id: string; title: string; slug: string; viewCount: number; periodViews: number }[]
  commentTrend: { date: string; count: number }[]
  tagDistribution: { name: string; views: number; articleCount: number }[]
}

export default function StatsPage() {
  const [period, setPeriod] = useState(30)
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/stats?period=${period}`)
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [period])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl text-text">
          统计
        </h1>
        <div className="flex gap-1">
          {[7, 30, 90].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`font-[family-name:var(--font-mono)] text-xs px-3 py-1.5 rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
                period === p
                  ? 'bg-accent text-white'
                  : 'bg-bg-card text-text-secondary hover:text-text'
              }`}
            >
              {p}天
            </button>
          ))}
        </div>
      </div>
      <div className="border-b border-dashed border-border-light mb-6" />

      {loading || !data ? (
        <div className="font-[family-name:var(--font-mono)] text-sm text-text-secondary py-12 text-center">
          加载中...
        </div>
      ) : (
        <>
          {/* Overview cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: '期间浏览', value: data.overview.periodViews.toLocaleString() },
              { label: '累计浏览', value: data.overview.lifetimeViews.toLocaleString() },
              { label: '新评论', value: data.overview.totalComments.toLocaleString() },
              { label: '篇均浏览', value: data.overview.avgViewsPerArticle.toLocaleString() },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-bg-card rounded-[var(--radius-lg)] p-4 border border-dashed border-border-light"
              >
                <div className="font-[family-name:var(--font-mono)] text-xs text-text-secondary mb-1">
                  {card.label}
                </div>
                <div className="font-[family-name:var(--font-mono)] text-2xl text-text">
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          {/* Views trend chart */}
          <div className="bg-bg-card rounded-[var(--radius-lg)] p-5 border border-dashed border-border-light mb-6">
            <h2 className="font-[family-name:var(--font-heading)] text-lg text-text mb-4">
              浏览趋势
            </h2>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data.viewsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}
                  stroke="var(--color-text-secondary)"
                />
                <YAxis
                  tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}
                  stroke="var(--color-text-secondary)"
                />
                <Tooltip
                  labelFormatter={(l) => formatDate(l as string)}
                  contentStyle={{
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--color-border-light)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#7d9070"
                  fill="#7d9070"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Top articles */}
            <div className="bg-bg-card rounded-[var(--radius-lg)] p-5 border border-dashed border-border-light">
              <h2 className="font-[family-name:var(--font-heading)] text-lg text-text mb-4">
                热门文章
              </h2>
              {data.topArticles.length === 0 ? (
                <p className="font-[family-name:var(--font-mono)] text-xs text-text-secondary">
                  暂无数据
                </p>
              ) : (
                <ol className="space-y-2">
                  {data.topArticles.map((article, i) => (
                    <li
                      key={article.id}
                      className="flex items-center gap-3 py-1.5 border-b border-dashed border-border-light last:border-0"
                    >
                      <span className="font-[family-name:var(--font-mono)] text-xs text-accent w-5">
                        {i + 1}.
                      </span>
                      <span className="flex-1 text-sm text-text truncate">{article.title}</span>
                      <span className="font-[family-name:var(--font-mono)] text-xs text-text-secondary shrink-0">
                        {article.periodViews}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Tag distribution */}
            <div className="bg-bg-card rounded-[var(--radius-lg)] p-5 border border-dashed border-border-light">
              <h2 className="font-[family-name:var(--font-heading)] text-lg text-text mb-4">
                标签分布
              </h2>
              {data.tagDistribution.length === 0 ? (
                <p className="font-[family-name:var(--font-mono)] text-xs text-text-secondary">
                  暂无数据
                </p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={data.tagDistribution.slice(0, 6)}
                        dataKey="views"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        strokeWidth={1}
                        stroke="var(--color-bg-card)"
                      >
                        {data.tagDistribution.slice(0, 6).map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          fontSize: 12,
                          fontFamily: 'var(--font-mono)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px dashed var(--color-border-light)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {data.tagDistribution.slice(0, 6).map((tag, i) => (
                      <span
                        key={tag.name}
                        className="font-[family-name:var(--font-mono)] text-xs px-2 py-0.5 rounded-[var(--radius-sm)]"
                        style={{
                          backgroundColor: `${CHART_COLORS[i % CHART_COLORS.length]}20`,
                          color: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Comment trend */}
          <div className="bg-bg-card rounded-[var(--radius-lg)] p-5 border border-dashed border-border-light">
            <h2 className="font-[family-name:var(--font-heading)] text-lg text-text mb-4">
              评论趋势
            </h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.commentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}
                  stroke="var(--color-text-secondary)"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}
                  stroke="var(--color-text-secondary)"
                />
                <Tooltip
                  labelFormatter={(l) => formatDate(l as string)}
                  contentStyle={{
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--color-border-light)',
                  }}
                />
                <Bar dataKey="count" fill="#c9908e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
