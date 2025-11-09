'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, Flame, RefreshCw } from 'lucide-react'

interface TrendData {
  topic: string
  volume: number
  change: number
  trend: 'up' | 'down' | 'stable'
  sparkline: number[]
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min

  return (
    <div className="flex items-end h-8 gap-[2px]">
      {data.map((value, i) => {
        const height = range === 0 ? 50 : ((value - min) / range) * 100
        return (
          <div
            key={i}
            className="w-1 bg-blue-400 rounded-t"
            style={{ height: `${height}%` }}
          />
        )
      })}
    </div>
  )
}

function TrendIndicator({ trend, change }: { trend: string; change: number }) {
  if (trend === 'up') {
    return (
      <span className="flex items-center text-green-600 text-sm font-medium">
        <TrendingUp className="w-4 h-4 mr-1" />
        {change}%
      </span>
    )
  }
  if (trend === 'down') {
    return (
      <span className="flex items-center text-red-600 text-sm font-medium">
        <TrendingDown className="w-4 h-4 mr-1" />
        {Math.abs(change)}%
      </span>
    )
  }
  return (
    <span className="flex items-center text-gray-500 text-sm font-medium">
      <Minus className="w-4 h-4 mr-1" />
      {change}%
    </span>
  )
}

export default function TrendingTopicsLive() {
  const [trends, setTrends] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Topics to track - customize these based on your focus
  const TRACKED_QUERIES = [
    'ransomware',
    'zero trust',
    'AI security',
    'cloud security',
    'supply chain attack',
    'quantum encryption'
  ]

  useEffect(() => {
    fetchTrends()
  }, [])

  async function fetchTrends() {
    setLoading(true)
    setError(null)

    try {
      // Call your Supabase Edge Function
      const response = await fetch(
        'https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/fetch-trends',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // If you need authentication:
            // 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            queries: TRACKED_QUERIES,
            timeframe: 'today 3-m' // Last 3 months
          })
        }
      )

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Process the results
      const processed = data.results.map((result: any) => {
        const timeline = result.data.timeline || []
        const currentValue = timeline[timeline.length - 1]?.value || 0
        const previousValue = timeline[timeline.length - 8]?.value || currentValue
        const change = previousValue > 0
          ? Math.round(((currentValue - previousValue) / previousValue) * 100)
          : 0

        return {
          topic: result.query,
          volume: currentValue,
          change,
          trend: change > 10 ? 'up' : change < -10 ? 'down' : 'stable',
          sparkline: timeline.slice(-7).map((t: any) => t.value)
        }
      })

      // Sort by change percentage
      processed.sort((a: TrendData, b: TrendData) => Math.abs(b.change) - Math.abs(a.change))

      setTrends(processed)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch trends:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch trends')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-600">Loading trending topics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchTrends}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">Trending Topics</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Last 7 days</span>
          <button
            onClick={fetchTrends}
            className="p-1 text-gray-400 hover:text-blue-600 rounded"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {trends.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded px-2 -mx-2 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3 flex-1">
              <span className="text-sm font-medium text-gray-500 w-6">
                {index + 1}.
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.topic}</p>
                <p className="text-xs text-gray-500">
                  {item.volume > 0 ? `Interest: ${item.volume}/100` : 'Limited data'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <TrendIndicator trend={item.trend} change={item.change} />
              <div className="w-16">
                {item.sparkline.length > 0 ? (
                  <Sparkline data={item.sparkline} />
                ) : (
                  <span className="text-xs text-gray-400">No data</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <a
          href="/trends"
          className="block w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View Detailed Trends →
        </a>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-800">
          <strong>Data Source:</strong> Google Trends via SerpApi • Updated every 24 hours
        </p>
      </div>
    </div>
  )
}
