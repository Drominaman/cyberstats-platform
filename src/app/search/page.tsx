'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, Calendar, Tag, Building2, Download, Bookmark } from 'lucide-react'
import Navigation from '@/components/Navigation'

interface Stat {
  id: number
  title: string
  link: string
  publisher: string
  source_name: string
  published_on: string
  created_at: string
  tags?: string[]
  stat_type?: string
}

// Helper to create URL-safe slug from title
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

export default function SearchPage() {
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [count, setCount] = useState(0)

  // Filters
  const [dateRange, setDateRange] = useState('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedPublishers, setSelectedPublishers] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('relevance')

  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (query) {
      searchStats()
    }
  }, [query, dateRange, sortBy])

  async function searchStats() {
    setLoading(true)
    try {
      const apiKey = process.env.NEXT_PUBLIC_API_KEY
      let url = `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&limit=50&count=1`

      if (query) url += `&q=${encodeURIComponent(query)}`
      if (sortBy) url += `&sort=${sortBy}`

      const response = await fetch(url)
      const data = await response.json()

      setStats(data.items || [])
      // Use total_count if available, otherwise fall back to items length
      setCount(data.total_count || data.count || data.items?.length || 0)
      setLoading(false)
    } catch (error) {
      console.error('Search failed:', error)
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    searchStats()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for ransomware, zero trust, data breaches..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg text-gray-900"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="date">Newest First</option>
                  <option value="publisher">By Publisher</option>
                </select>

                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date Range
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Past Week</option>
                    <option value="month">Past Month</option>
                    <option value="year">Past Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Topic Tags
                  </label>
                  <input
                    type="text"
                    placeholder="Filter by tags..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Publisher
                  </label>
                  <input
                    type="text"
                    placeholder="Filter by publisher..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Results */}
        {query && (
          <div className="mb-4">
            <p className="text-gray-600">
              {loading ? 'Searching...' : `Found ${count.toLocaleString()} results for "${query}"`}
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-500">Searching statistics...</p>
            </div>
          ) : stats.length === 0 && query ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500">Try adjusting your search terms or filters</p>
            </div>
          ) : stats.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start your search</h3>
              <p className="text-gray-500">Enter keywords to search 8000+ cybersecurity statistics</p>
            </div>
          ) : (
            stats.map((stat) => (
              <div
                key={stat.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/stats/${createSlug(stat.title)}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 mb-2 block break-words"
                    >
                      {stat.title}
                    </Link>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mb-3">
                      <span className="flex items-center">
                        <Building2 className="w-4 h-4 mr-1" />
                        {stat.publisher}
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(stat.published_on || stat.created_at).toLocaleDateString()}
                      </span>
                      {stat.source_name && (
                        <>
                          <span>•</span>
                          <span>{stat.source_name}</span>
                        </>
                      )}
                    </div>

                    {stat.tags && stat.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {stat.tags.map((tag, i) => (
                          <Link
                            key={i}
                            href={`/categories/${tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  <button className="sm:ml-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg flex-shrink-0">
                    <Bookmark className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More */}
        {stats.length > 0 && stats.length < count && (
          <div className="mt-8 text-center">
            <button className="px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600">
              Load More Results
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
