'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { Building2, FileText, ChevronRight, Loader, Target, Calendar, Tag, Globe, MapPin } from 'lucide-react'

interface VendorOverride {
  slug: string
  custom_description?: string
  website?: string
  founded?: string
  headquarters?: string
}

export default function VendorDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [vendorName, setVendorName] = useState<string>('')
  const [stats, setStats] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [relatedVendors, setRelatedVendors] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timePeriod, setTimePeriod] = useState<'7d' | '30d' | '90d' | 'all'>('all')
  const [vendorOverride, setVendorOverride] = useState<VendorOverride | null>(null)

  useEffect(() => {
    fetchVendorData()
  }, [slug, timePeriod])

  async function fetchVendorData() {
    try {
      const apiKey = process.env.NEXT_PUBLIC_API_KEY

      // Fetch vendor override data from API
      const vendorRes = await fetch(`/api/vendors?slug=${slug}`)
      const vendorData = await vendorRes.json()
      if (vendorData.data) {
        setVendorOverride(vendorData.data)
      }

      // Always fetch all available data to ensure vendor exists
      const response = await fetch(
        `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&limit=5000&days=365`
      )
      const data = await response.json()

      // Check for API errors (rate limits, etc.)
      if (!data || !data.items || !Array.isArray(data.items)) {
        console.error('Invalid API response:', data)
        setLoading(false)
        return
      }

      // Find all stats for this vendor by matching slug
      const allVendorStats = data.items.filter((item: any) => {
        if (!item.publisher) return false
        const itemSlug = item.publisher.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        return itemSlug === slug
      })

      console.log(`Found ${allVendorStats.length} total stats for slug "${slug}"`)

      if (allVendorStats.length === 0) {
        console.error(`No stats found for vendor slug: ${slug}`)
        setLoading(false)
        return
      }

      // Filter by time period for display
      let vendorStats = allVendorStats

      if (timePeriod !== 'all') {
        const daysMap = { '7d': 7, '30d': 30, '90d': 90 }
        const days = daysMap[timePeriod as '7d' | '30d' | '90d']
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)

        vendorStats = allVendorStats.filter((item: any) => {
          const itemDate = new Date(item.created_at)
          return itemDate >= cutoffDate
        })
      }

      console.log(`After ${timePeriod} filter: ${vendorStats.length} stats (from ${allVendorStats.length} total)`)

      setStats(vendorStats)
      setVendorName(allVendorStats[0].publisher) // Use first stat from ALL stats for vendor name

      // Extract categories from tags
      const categoryMap: { [key: string]: number } = {}
      vendorStats.forEach((stat: any) => {
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

      setCategories(topCategories)

      // Find related vendors (vendors with similar category tags)
      const allVendorsMap: { [key: string]: { stats: any[], tags: Set<string> } } = {}
      data.items.forEach((item: any) => {
        if (item.publisher && item.publisher !== allVendorStats[0].publisher) {
          if (!allVendorsMap[item.publisher]) {
            allVendorsMap[item.publisher] = { stats: [], tags: new Set() }
          }
          allVendorsMap[item.publisher].stats.push(item)
          if (item.tags) {
            item.tags.forEach((tag: string) => allVendorsMap[item.publisher].tags.add(tag))
          }
        }
      })

      // Score vendors by tag overlap
      const vendorTags = new Set<string>()
      vendorStats.forEach((stat: any) => {
        if (stat.tags) {
          stat.tags.forEach((tag: string) => vendorTags.add(tag))
        }
      })

      const scoredVendors = Object.entries(allVendorsMap).map(([name, data]) => {
        let overlap = 0
        data.tags.forEach(tag => {
          if (vendorTags.has(tag)) overlap++
        })
        return {
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          statsCount: data.stats.length,
          overlap
        }
      })

      const topRelated = scoredVendors
        .filter(v => v.overlap > 0)
        .sort((a, b) => b.overlap - a.overlap)
        .slice(0, 6)

      setRelatedVendors(topRelated)

      // Extract unique reports by source_name
      const reportsMap = new Map()
      vendorStats.forEach((stat: any) => {
        if (stat.source_name && stat.link && !reportsMap.has(stat.source_name)) {
          reportsMap.set(stat.source_name, {
            title: stat.source_name.replace('.html', '').replace(/_/g, ' '),
            link: stat.link,
            published_on: stat.published_on || stat.created_at,
            stats_count: vendorStats.filter((s: any) => s.source_name === stat.source_name).length
          })
        }
      })

      const uniqueReports = Array.from(reportsMap.values())
        .sort((a, b) => new Date(b.published_on).getTime() - new Date(a.published_on).getTime())
        .slice(0, 10)

      setReports(uniqueReports)

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch vendor data:', error)
      setLoading(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex items-center justify-center">
            <div className="text-center">
              <Loader className="w-10 h-10 text-green-600 animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Loading vendor data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!vendorName) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Vendor Not Found</h1>
            <Link href="/vendors" className="text-green-600 hover:text-green-700">
              ← Back to Vendors
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/vendors" className="hover:text-green-600">Vendors</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">{vendorName}</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="p-4 bg-green-100 rounded-xl">
                <Building2 className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{vendorName}</h1>

                {/* Custom Description */}
                {vendorOverride?.custom_description ? (
                  <p className="text-gray-600 mb-3">{vendorOverride.custom_description}</p>
                ) : (
                  <p className="text-gray-600 mb-3">Cybersecurity reports and statistics published by {vendorName}</p>
                )}

                {/* Vendor Details */}
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm">
                  {vendorOverride?.website && (
                    <a
                      href={vendorOverride.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-green-600 hover:text-green-700 font-medium"
                    >
                      <Globe className="w-4 h-4 mr-1" />
                      Visit Website
                    </a>
                  )}
                  {vendorOverride?.founded && (
                    <span className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      Founded {vendorOverride.founded}
                    </span>
                  )}
                  {vendorOverride?.headquarters && (
                    <span className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {vendorOverride.headquarters}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-4 mt-3 text-sm">
                  <span className="flex items-center text-gray-500">
                    <Target className="w-4 h-4 mr-1" />
                    {categories.length} categories
                  </span>
                  <span className="flex items-center text-gray-500">
                    <Building2 className="w-4 h-4 mr-1" />
                    {reports.length} reports
                  </span>
                </div>
              </div>
            </div>

            {/* Time Period Selector */}
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Reports */}
            {reports.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Research Reports</h2>
                <p className="text-sm text-gray-500 mb-6">Reports and publications from {vendorName}</p>
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
                      <div key={i} className="py-4 hover:bg-gray-50 transition-colors -mx-6 px-6">
                        <h3 className="font-medium text-gray-900 mb-2">{stat.title}</h3>
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
                                  <span key={j} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
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
            {relatedVendors.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Related Vendors</h3>
                <div className="space-y-3">
                  {relatedVendors.map((vendor, i) => (
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
      </div>
    </div>
  )
}
