export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const cron = await import('node-cron')
    const { fetchAllActiveSources, cleanOldNews } = await import('@/lib/rss-fetcher')

    const runNewsJob = async () => {
      console.log('[cron] 开始抓取 AI 资讯...')
      try {
        const results = await fetchAllActiveSources()
        const fetched = results.reduce((sum, r) => sum + r.fetched, 0)
        const skipped = results.reduce((sum, r) => sum + (r.skipped || 0), 0)
        const errors = results.filter(r => r.error)
        console.log(`[cron] 完成: 抓取 ${fetched} 条, 过滤 ${skipped} 条非 AI 内容, ${errors.length} 个源出错`)
      } catch (e) {
        console.error('[cron] 抓取失败:', e)
      }

      try {
        const deleted = await cleanOldNews()
        if (deleted > 0) console.log(`[cron] 清理 ${deleted} 条过期资讯`)
      } catch (e) {
        console.error('[cron] 清理失败:', e)
      }
    }

    // 每天 9:00、14:00、21:00 执行
    cron.schedule('0 9,14,21 * * *', runNewsJob)
    console.log('[cron] 资讯定时任务已启动: 9:00, 14:00, 21:00')
  }
}
