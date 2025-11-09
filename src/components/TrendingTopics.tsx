'use client'

import { TrendingUp, TrendingDown, Minus, Flame } from 'lucide-react'

interface TrendData {
  topic: string
  volume: number
  change: number
  trend: 'up' | 'down' | 'stable'
  sparkline: number[]
}

// Mock data - in production, this would come from SerpApi/DataForSEO
const MOCK_TRENDS: TrendData[] = [
  {
    topic: 'ransomware payments',
    volume: 8500,
    change: 45,
    trend: 'up',
    sparkline: [20, 35, 45, 65, 85, 92, 100]
  },
  {
    topic: 'AI security',
    volume: 12400,
    change: 38,
    trend: 'up',
    sparkline: [30, 42, 58, 68, 82, 90, 100]
  },
  {
    topic: 'zero trust',
    volume: 6200,
    change: 22,
    trend: 'up',
    sparkline: [60, 65, 68, 75, 82, 88, 100]
  },
  {
    topic: 'supply chain attack',
    volume: 3800,
    change: -12,
    trend: 'down',
    sparkline: [100, 95, 85, 75, 65, 58, 52]
  },
  {
    topic: 'quantum encryption',
    volume: 2100,
    change: 67,
    trend: 'up',
    sparkline: [15, 18, 28, 42, 65, 85, 100]
  },
  {
    topic: 'cloud security',
    volume: 15600,
    change: 5,
    trend: 'stable',
    sparkline: [92, 94, 95, 97, 98, 99, 100]
  }
]

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

export default function TrendingTopics() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">Trending This Week</h3>
        </div>
        <span className="text-xs text-gray-500">Last 7 days</span>
      </div>

      <div className="space-y-4">
        {MOCK_TRENDS.map((item, index) => (
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
                <p className="text-xs text-gray-500">{item.volume.toLocaleString()} searches</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <TrendIndicator trend={item.trend} change={item.change} />
              <div className="w-16">
                <Sparkline data={item.sparkline} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All Trends →
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-800">
          <strong>Coming Soon:</strong> Track custom topics and get alerts when search volumes spike
        </p>
      </div>
    </div>
  )
}
