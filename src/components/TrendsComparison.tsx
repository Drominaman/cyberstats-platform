'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, Flame, Building2, Target, ArrowUpRight, Loader } from 'lucide-react'
import Link from 'next/link'

interface TrendItem {
  name: string
  type: 'topic' | 'vendor'
  interest: number // 0-100 score from Google Trends
  change: number // percentage change
  trend: 'up' | 'down' | 'stable'
  searches: string // estimated monthly searches (calculated from interest)
  topQuery: string // most popular related search
}

// Number of top vendors/topics to track
const TOP_VENDORS_COUNT = 20 // Top 20 vendors by mention count
const TOP_TOPICS_COUNT = 20 // Top 20 topics by mention count

// Mock data - used as fallback
const MOCK_TRENDS: TrendItem[] = [
  // Topics
  {
    name: 'AI Security',
    type: 'topic',
    interest: 92,
    change: 215,
    trend: 'up',
    searches: '45K/mo',
    topQuery: 'AI security tools'
  },
  {
    name: 'Ransomware',
    type: 'topic',
    interest: 85,
    change: 45,
    trend: 'up',
    searches: '50K/mo',
    topQuery: 'ransomware prevention'
  },
  {
    name: 'Zero Trust',
    type: 'topic',
    interest: 78,
    change: 38,
    trend: 'up',
    searches: '35K/mo',
    topQuery: 'zero trust implementation'
  },
  {
    name: 'Cloud Security',
    type: 'topic',
    interest: 72,
    change: 5,
    trend: 'stable',
    searches: '60K/mo',
    topQuery: 'cloud security best practices'
  },

  // Vendors
  {
    name: 'Crowdstrike',
    type: 'vendor',
    interest: 100,
    change: 67,
    trend: 'up',
    searches: '120K/mo',
    topQuery: 'crowdstrike alternatives'
  },
  {
    name: 'Palo Alto Networks',
    type: 'vendor',
    interest: 78,
    change: 12,
    trend: 'up',
    searches: '85K/mo',
    topQuery: 'palo alto firewall'
  },
  {
    name: 'SentinelOne',
    type: 'vendor',
    interest: 65,
    change: 125,
    trend: 'up',
    searches: '45K/mo',
    topQuery: 'sentinelone vs crowdstrike'
  },
  {
    name: 'Wiz Security',
    type: 'vendor',
    interest: 42,
    change: 280,
    trend: 'up',
    searches: '15K/mo',
    topQuery: 'wiz cloud security'
  }
]

function InterestBar({ value }: { value: number }) {
  return (
    <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className="bg-blue-500 h-full rounded-full"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

function TrendIndicator({ trend, change }: { trend: string; change: number }) {
  if (trend === 'up') {
    return (
      <span className="flex items-center text-green-600 text-xs font-semibold">
        <TrendingUp className="w-3 h-3 mr-1" />
        {change}%
      </span>
    )
  }
  if (trend === 'down') {
    return (
      <span className="flex items-center text-red-600 text-xs font-semibold">
        <TrendingDown className="w-3 h-3 mr-1" />
        {Math.abs(change)}%
      </span>
    )
  }
  return (
    <span className="flex items-center text-gray-500 text-xs font-semibold">
      <Minus className="w-3 h-3 mr-1" />
      {change}%
    </span>
  )
}

export default function TrendsComparison() {
  const [filter, setFilter] = useState<'all' | 'topic' | 'vendor'>('all')
  const [sortBy, setSortBy] = useState<'interest' | 'change'>('interest')
  const [trends, setTrends] = useState<TrendItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadProgress, setLoadProgress] = useState({ loaded: 0, total: 0, currentBatch: 0, totalBatches: 0 })

  // Fetch vendors and topics from database, then get trends
  useEffect(() => {
    async function fetchDatabaseAndTrends() {
      try {
        setLoading(true)
        setError(null)

        const apiKey = process.env.NEXT_PUBLIC_API_KEY

        // Step 1: Fetch data from your database to get top publishers and tags
        console.log('📊 Step 1: Fetching top vendors and topics from database...')
        const dbResponse = await fetch(
          `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&limit=500&digest=monthly`
        )
        const dbData = await dbResponse.json()

        if (!dbData.items || dbData.items.length === 0) {
          throw new Error('No data available from database')
        }

        // Step 2: Count publishers (vendors) and tags (topics)
        const publisherCounts: { [key: string]: number } = {}
        const tagCounts: { [key: string]: number } = {}

        dbData.items.forEach((item: any) => {
          // Count publishers
          if (item.publisher) {
            publisherCounts[item.publisher] = (publisherCounts[item.publisher] || 0) + 1
          }
          // Count tags
          if (item.tags) {
            item.tags.forEach((tag: string) => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1
            })
          }
        })

        // Get top vendors (sorted by mention count) and top topics
        const topVendors = Object.entries(publisherCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, TOP_VENDORS_COUNT) // Limit to top 50 vendors
          .map(([name]) => name)

        const topTopics = Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, TOP_TOPICS_COUNT)
          .map(([name]) => name)

        const allKeywords = [...topTopics, ...topVendors]
        const vendorSet = new Set(topVendors)

        console.log(`✓ Found ${topVendors.length} vendors and ${topTopics.length} topics from database`)
        console.log(`📈 Step 2: Fetching Google Trends data for ${allKeywords.length} keywords...`)

        // Step 3: Fetch Google Trends data in batches
        const BATCH_SIZE = 20
        const allResults: any[] = []
        const totalBatches = Math.ceil(allKeywords.length / BATCH_SIZE)

        // Set initial progress
        setLoadProgress({ loaded: 0, total: allKeywords.length, currentBatch: 0, totalBatches })

        for (let i = 0; i < allKeywords.length; i += BATCH_SIZE) {
          const batch = allKeywords.slice(i, i + BATCH_SIZE)
          const batchNum = Math.floor(i / BATCH_SIZE) + 1
          console.log(`→ Batch ${batchNum}/${totalBatches}: ${batch.length} keywords`)

          // Update progress - current batch
          setLoadProgress({ loaded: allResults.length, total: allKeywords.length, currentBatch: batchNum, totalBatches })

          try {
            const trendsResponse = await fetch('https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/dataforseo-trends', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` },
              body: JSON.stringify({ keywords: batch, timeframe: '3m' })
            })

            if (!trendsResponse.ok) {
              console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed`)
              continue
            }

            const trendsData = await trendsResponse.json()
            allResults.push(...trendsData.results)

            // Update progress after batch completes
            setLoadProgress({ loaded: allResults.length, total: allKeywords.length, currentBatch: batchNum, totalBatches })

            // Update UI progressively
            const transformedTrends: TrendItem[] = allResults.map((result: any) => {
              const keyword = result.keyword
              const trendData = result.data
              const isVendor = vendorSet.has(keyword)

              let trend: 'up' | 'down' | 'stable' = 'stable'
              if (trendData.change_percent > 5) trend = 'up'
              else if (trendData.change_percent < -5) trend = 'down'

              const estimatedSearches = Math.round((trendData.current_value / 100) * 50000)
              const searchesFormatted = estimatedSearches >= 1000
                ? `${Math.round(estimatedSearches / 1000)}K/mo`
                : `${estimatedSearches}/mo`

              return {
                name: keyword,
                type: isVendor ? 'vendor' : 'topic',
                interest: trendData.current_value,
                change: trendData.change_percent,
                trend,
                searches: searchesFormatted,
                topQuery: trendData.top_query || `${keyword} trends`
              }
            })

            setTrends(transformedTrends)
            console.log(`✓ Loaded ${transformedTrends.length}/${allKeywords.length} keywords`)

          } catch (err) {
            console.error(`Error in batch ${Math.floor(i / BATCH_SIZE) + 1}:`, err)
          }
        }

        if (allResults.length === 0) {
          throw new Error('No trends data loaded')
        }

        console.log(`✓ Complete! Tracking ${allResults.length} keywords from your database`)
      } catch (err: any) {
        console.error('Error:', err)
        setError(err.message || 'Failed to load trends data')
        setTrends([])
      } finally {
        setLoading(false)
      }
    }

    fetchDatabaseAndTrends()
  }, [])

  const filteredTrends = trends
    .filter(item => filter === 'all' || item.type === filter)
    .sort((a, b) => {
      if (sortBy === 'interest') return b.interest - a.interest
      return Math.abs(b.change) - Math.abs(a.change)
    })

  const topGrowing = trends.length > 0 ? [...trends].sort((a, b) => b.change - a.change)[0] : null
  const topInterest = trends.length > 0 ? [...trends].sort((a, b) => b.interest - a.interest)[0] : null

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-medium text-red-800">Failed to load trends data</p>
          <p className="text-xs text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Loader className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Loading Search Trends
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              {loadProgress.total > 0
                ? `Fetching trends for ${loadProgress.total} keywords from Google Trends API`
                : 'Preparing data from your database...'}
            </p>

            {loadProgress.total > 0 && (
              <>
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span>
                      {loadProgress.currentBatch > 0
                        ? `Batch ${loadProgress.currentBatch}/${loadProgress.totalBatches}`
                        : 'Initializing...'}
                    </span>
                    <span>{Math.round((loadProgress.loaded / loadProgress.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${(loadProgress.loaded / loadProgress.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Loaded {loadProgress.loaded} of {loadProgress.total} keywords
                  </p>
                </div>

                {/* Partial Results Preview */}
                {trends.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-600 text-center mb-3">
                      Showing partial results ({trends.length} loaded)
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Flame className="w-5 h-5 text-orange-500 mr-2" />
              Search Interest Trends
              {!loading && (
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Live Data
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Top {TOP_VENDORS_COUNT} vendors and top {TOP_TOPICS_COUNT} topics from your database with real-time search trends
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('topic')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
              filter === 'topic'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Target className="w-4 h-4 mr-1" />
            Topics
          </button>
          <button
            onClick={() => setFilter('vendor')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
              filter === 'vendor'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Building2 className="w-4 h-4 mr-1" />
            Vendors
          </button>

          <div className="flex-1" />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'interest' | 'change')}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="interest">Sort by Interest</option>
            <option value="change">Sort by Growth</option>
          </select>
        </div>
      </div>

      {/* Key Insights */}
      {!loading && trends.length > 0 && topGrowing && topInterest && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-700 font-medium mb-1">Fastest Growing</p>
                <p className="text-lg font-bold text-green-900">{topGrowing.name}</p>
                <p className="text-sm text-green-700 mt-1">+{topGrowing.change}% increase</p>
              </div>
              <ArrowUpRight className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-700 font-medium mb-1">Most Searched</p>
                <p className="text-lg font-bold text-blue-900">{topInterest.name}</p>
                <p className="text-sm text-blue-700 mt-1">{topInterest.searches}</p>
              </div>
              <Flame className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      )}

      {/* Trends List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase">
            <div className="col-span-3">Name</div>
            <div className="col-span-2">Interest Score</div>
            <div className="col-span-2">Searches/Mo</div>
            <div className="col-span-2">Trend</div>
            <div className="col-span-3">Top Related Search</div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredTrends.map((item, index) => (
            <Link
              key={index}
              href={`/detail/${encodeURIComponent(item.name)}`}
              className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer block"
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Name */}
                <div className="col-span-3 flex items-center space-x-2">
                  {item.type === 'vendor' ? (
                    <Building2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Target className="w-4 h-4 text-purple-500" />
                  )}
                  <span className="font-medium text-gray-900 hover:text-blue-600">{item.name}</span>
                </div>

                {/* Interest Score */}
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <InterestBar value={item.interest} />
                    <span className="text-sm font-semibold text-gray-900">{item.interest}</span>
                  </div>
                </div>

                {/* Searches */}
                <div className="col-span-2">
                  <span className="text-sm text-gray-600">{item.searches}</span>
                </div>

                {/* Trend */}
                <div className="col-span-2">
                  <TrendIndicator trend={item.trend} change={item.change} />
                </div>

                {/* Top Query */}
                <div className="col-span-3">
                  <span className="text-xs text-gray-500 italic">&ldquo;{item.topQuery}&rdquo;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">i</span>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Dynamic Market Intelligence Dashboard
            </h4>
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>Auto-selected:</strong> Top {TOP_VENDORS_COUNT} vendors and top {TOP_TOPICS_COUNT} topics are automatically pulled from your cyberstats database based on mention frequency. Each one links to comprehensive reports and statistics.
              <br />
              <strong>Interest Score (0-100):</strong> Relative search volume from Google Trends. 100 = peak interest.
              <br />
              <strong>Trend %:</strong> Change vs previous period. Shows market momentum.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
