import { useEffect, useState } from 'react'
import { requestJson } from '../../shared/api.js'
import { normalizeHomePayload } from './homeAdapters.js'
import { fallbackHomeContent } from './homeData.js'

export function useHomePageData() {
  const [health, setHealth] = useState({
    loading: true,
    error: '',
    data: null,
  })

  const [homeContent, setHomeContent] = useState({
    loading: false,
    ...fallbackHomeContent,
  })

  useEffect(() => {
    let cancelled = false

    const loadDashboard = async () => {
      let healthPayload = null

      try {
        healthPayload = await requestJson('/api/health')

        if (cancelled) {
          return
        }

        setHealth({
          loading: false,
          error: '',
          data: healthPayload,
        })

        const databaseStatus = healthPayload?.services?.database?.status ?? 'unknown'

        if (databaseStatus !== 'connected') {
          setHealth({
            loading: false,
            error: 'MongoDB chưa kết nối. Đang hiển thị dữ liệu mẫu.',
            data: healthPayload,
          })
          return
        }

        setHomeContent((current) => ({
          ...current,
          loading: true,
        }))

        const homePayload = await requestJson('/api/home')

        if (!cancelled) {
          setHomeContent({
            loading: false,
            ...normalizeHomePayload(homePayload),
          })
        }
      } catch (error) {
        if (cancelled) {
          return
        }

        setHealth({
          loading: false,
          error: 'Không thể tải dữ liệu từ API. Đang hiển thị dữ liệu mẫu.',
          data: healthPayload,
        })

        setHomeContent({
          loading: false,
          ...fallbackHomeContent,
        })

        console.error('Failed to load home dashboard data:', error)
      }
    }

    void loadDashboard()

    return () => {
      cancelled = true
    }
  }, [])

  const databaseStatus = health.data?.services?.database?.status ?? 'unknown'
  const isLive = !health.error && databaseStatus === 'connected'

  return {
    health,
    homeContent,
    isLive,
  }
}