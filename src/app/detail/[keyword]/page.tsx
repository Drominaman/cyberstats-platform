'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, FileText, Tag, Calendar, ArrowLeft, Loader, BarChart3 } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Link from 'next/link'

interface TrendData {
  timeline: { date: string; value: number }[]
  current_value: number
  change_percent: number
}

interface Report {
  title: string
  publisher: string
  created_at: string
  link: string
  tags: string[]
}

interface RelatedTopic {
  name: string
  count: number
}

export default function DetailPage({ params }: { params: { keyword: string } }) {
  const keyword = decodeURIComponent(params.keyword)

  const [trendData, setTrendData] = useState<TrendData | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [relatedTopics, setRelatedTopics] = useState<RelatedTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllData()
  }, [keyword])

  async function fetchAllData() {
    try {
      setLoading(true)
      setError(null)

      // Fetch Google Trends data
      const trendsResponse = await fetch('https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/dataforseo-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ keywords: [keyword], timeframe: '3m' })
      })

      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json()
        if (trendsData.results && trendsData.results.length > 0) {
          setTrendData(trendsData.results[0].data)
        }
      }

      // Fetch reports/stats from your database
      const apiKey = process.env.NEXT_PUBLIC_API_KEY
      const statsResponse = await fetch(
        `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&q=${encodeURIComponent(keyword)}&format=json&limit=50`
      )

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setReports(statsData.items || [])

        // Extract related topics from tags
        const topicCounts: { [key: string]: number } = {}
        statsData.items?.forEach((item: Report) => {
          item.tags?.forEach((tag: string) => {
            if (tag.toLowerCase() !== keyword.toLowerCase()) {
              topicCounts[tag] = (topicCounts[tag] || 0) + 1
            }
          })
        })

        const topics = Object.entries(topicCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)

        setRelatedTopics(topics)
      }

    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/trends" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Trends
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{keyword}</h1>
          <p className="text-lg text-gray-600">Comprehensive intelligence report</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600">Loading data...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search Trends Chart */}
              {trendData && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                      Search Interest Trend
                    </h2>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{trendData.current_value}</div>
                      <div className={`text-sm flex items-center ${trendData.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trendData.change_percent >= 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        {Math.abs(trendData.change_percent)}% vs last period
                      </div>
                    </div>
                  </div>

                  {/* Simple line chart */}
                  <div className="h-64 flex items-end space-x-1">
                    {trendData.timeline.slice(-30).map((point, i) => {
                      const max = Math.max(...trendData.timeline.map(p => p.value))
                      const height = (point.value / max) * 100
                      return (
                        <div
                          key={i}
                          className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                          style={{ height: `${height}%` }}
                          title={`${point.date}: ${point.value}`}
                        />
                      )
                    })}
                  </div>
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    Last 30 days
                  </div>
                </div>
              )}

              {/* Reports & Statistics */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Reports & Statistics
                  <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    {reports.length}
                  </span>
                </h2>

                <div className="space-y-4">
                  {reports.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No reports found</p>
                  ) : (
                    reports.slice(0, 20).map((report, idx) => (
                      <div key={idx} className="border-b border-gray-100 pb-4 last:border-0">
                        <a
                          href={report.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-900 hover:text-blue-600 font-medium block mb-1"
                        >
                          {report.title}
                        </a>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{report.publisher}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {report.tags && report.tags.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {report.tags.slice(0, 5).map((tag, i) => (
                              <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {reports.length > 20 && (
                  <div className="mt-4 text-center">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View all {reports.length} reports →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">Total Reports</div>
                    <div className="text-2xl font-bold text-gray-900">{reports.length}</div>
                  </div>
                  {trendData && (
                    <>
                      <div>
                        <div className="text-sm text-gray-500">Search Interest</div>
                        <div className="text-2xl font-bold text-gray-900">{trendData.current_value}/100</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Trend</div>
                        <div className={`text-xl font-bold ${trendData.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trendData.change_percent >= 0 ? '+' : ''}{trendData.change_percent}%
                        </div>
                      </div>
                    </>
                  )}
                  <div>
                    <div className="text-sm text-gray-500">Related Topics</div>
                    <div className="text-2xl font-bold text-gray-900">{relatedTopics.length}</div>
                  </div>
                </div>
              </div>

              {/* Related Topics */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Tag className="w-5 h-5 mr-2 text-green-600" />
                  Related Topics
                </h3>
                <div className="space-y-2">
                  {relatedTopics.length === 0 ? (
                    <p className="text-sm text-gray-500">No related topics found</p>
                  ) : (
                    relatedTopics.map((topic, idx) => (
                      <Link
                        key={idx}
                        href={`/detail/${encodeURIComponent(topic.name)}`}
                        className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm text-gray-700">{topic.name}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {topic.count}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Publishers */}
              {reports.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Publishers</h3>
                  <div className="space-y-2">
                    {Object.entries(
                      reports.reduce((acc, r) => {
                        acc[r.publisher] = (acc[r.publisher] || 0) + 1
                        return acc
                      }, {} as { [key: string]: number })
                    )
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([publisher, count], idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{publisher}</span>
                          <span className="text-gray-500">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
