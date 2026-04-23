export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const cron = await import('node-cron')
    const { fetchAllActiveSources, cleanOldNews } = await import('@/lib/rss-fetcher')
    const { revalidatePath } = await import('next/cache')

    const runNewsJob = async () => {
      console.log('[cron] 开始抓取 AI 资讯...')
      try {
        const results = await fetchAllActiveSources()
        const inserted = results.reduce((sum, r) => sum + r.inserted, 0)
        const updated = results.reduce((sum, r) => sum + r.updated, 0)
        const filtered = results.reduce((sum, r) => sum + r.filtered, 0)
        const failed = results.reduce((sum, r) => sum + r.failed, 0)
        const errors = results.filter(r => r.errorMessage)

        console.log(`[cron] 完成: 新增 ${inserted} 条, 更新 ${updated} 条, 过滤 ${filtered} 条非 AI 内容, 单条失败 ${failed} 条, ${errors.length} 个源出错`)
        errors.forEach(result => {
          console.error(`[cron] 来源失败: ${result.source} - ${result.errorMessage}`)
        })

        if (inserted > 0 || updated > 0) {
          revalidatePath('/news')
        }
      } catch (e) {
        console.error('[cron] 抓取失败:', e)
      }

      try {
        const deleted = await cleanOldNews()
        if (deleted > 0) {
          console.log(`[cron] 清理 ${deleted} 条过期资讯`)
          revalidatePath('/news')
        }
      } catch (e) {
        console.error('[cron] 清理失败:', e)
      }
    }

    // 每天 9:00、14:00、21:00 执行
    cron.schedule('0 9,14,21 * * *', runNewsJob)
    console.log('[cron] 资讯定时任务已启动: 9:00, 14:00, 21:00')
  }
}
