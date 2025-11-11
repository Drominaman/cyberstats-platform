'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { FileText, ChevronRight, Calendar, Tag, Building2 } from 'lucide-react'

interface VendorData {
  vendorName: string
  slug: string
  allStats: any[]
  categories: any[]
  relatedVendors: any[]
  reports: any[]
}

// Helper to create URL-safe slug from title
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

export default function VendorDetailClient({ vendorData }: { vendorData: VendorData }) {
  const [timePeriod, setTimePeriod] = useState<'7d' | '30d' | '90d' | 'all'>('all')

  // Filter stats by time period
  const { stats, categories, reports } = useMemo(() => {
    let filteredStats = vendorData.allStats

    if (timePeriod !== 'all') {
      const daysMap = { '7d': 7, '30d': 30, '90d': 90 }
      const days = daysMap[timePeriod as '7d' | '30d' | '90d']
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      filteredStats = vendorData.allStats.filter((item: any) => {
        const itemDate = new Date(item.created_at)
        return itemDate >= cutoffDate
      })
    }

    // Recalculate categories based on filtered stats
    const categoryMap: { [key: string]: number } = {}
    filteredStats.forEach((stat: any) => {
      if (stat.tags) {
        stat.tags.forEach((tag: string) => {
          categoryMap[tag] = (categoryMap[tag] || 0) + 1
        })
      }
    })

    const topCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }))

    // Recalculate reports based on filtered stats
    const reportsMap = new Map()
    filteredStats.forEach((stat: any) => {
      if (stat.source_name && stat.link && !reportsMap.has(stat.source_name)) {
        reportsMap.set(stat.source_name, {
          title: stat.source_name.replace('.html', '').replace(/_/g, ' '),
          link: stat.link,
          published_on: stat.published_on || stat.created_at,
          stats_count: filteredStats.filter((s: any) => s.source_name === stat.source_name).length
        })
      }
    })

    const uniqueReports = Array.from(reportsMap.values())
      .sort((a, b) => new Date(b.published_on).getTime() - new Date(a.published_on).getTime())
      .slice(0, 10)

    return {
      stats: filteredStats,
      categories: topCategories,
      reports: uniqueReports
    }
  }, [vendorData.allStats, timePeriod])

  return (
    <>
      {/* Time Period Selector */}
      <div className="flex justify-end mb-6">
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setTimePeriod('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              timePeriod === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setTimePeriod('7d')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              timePeriod === '7d' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            7 days
          </button>
          <button
            onClick={() => setTimePeriod('30d')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              timePeriod === '30d' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            30 days
          </button>
          <button
            onClick={() => setTimePeriod('90d')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              timePeriod === '90d' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            90 days
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Reports */}
          {reports.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Research Reports</h2>
              <p className="text-sm text-gray-500 mb-6">Reports and publications from {vendorData.vendorName}</p>
              <div className="space-y-3">
                {reports.map((report: any, i: number) => (
                  <a
                    key={i}
                    href={report.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 group-hover:text-green-600 mb-2">
                        {report.title}
                      </h3>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(report.published_on).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Recent Statistics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Statistics & Reports</h2>
            {stats.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">No statistics found for the selected time period</p>
                <p className="text-sm text-gray-500">Try selecting a longer time period above to see more results.</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-100">
                  {stats.slice(0, 20).map((stat, i) => (
                    <Link
                      key={i}
                      href={`/stats/${createSlug(stat.title)}`}
                      className="block py-4 hover:bg-gray-50 transition-colors -mx-6 px-6 cursor-pointer"
                    >
                      <h3 className="font-medium text-gray-900 hover:text-green-600 mb-2 transition-colors">{stat.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(stat.created_at).toLocaleDateString()}
                        </span>
                        {stat.tags && stat.tags.length > 0 && (
                          <>
                            <span>•</span>
                            <div className="flex gap-2">
                              {stat.tags.slice(0, 3).map((tag: string, j: number) => (
                                <Link
                                  key={j}
                                  href={`/categories/${tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                                  className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {tag}
                                </Link>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                {stats.length > 20 && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">Showing first 20 results</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Categories */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Categories</h3>
            <div className="space-y-1">
              {categories.map((category, i) => (
                <Link
                  key={i}
                  href={`/categories/${category.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                  className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-purple-50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-purple-500 group-hover:text-purple-600 transition-colors" />
                    <span className="text-sm text-gray-700 group-hover:text-purple-900 group-hover:font-medium transition-all">{category.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 group-hover:text-purple-600">{category.count}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Related Vendors */}
          {vendorData.relatedVendors.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Related Vendors</h3>
              <div className="space-y-3">
                {vendorData.relatedVendors.map((vendor, i) => (
                  <Link
                    key={i}
                    href={`/vendors/${vendor.slug}`}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all"
                  >
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-900">{vendor.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{vendor.statsCount} stats</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
