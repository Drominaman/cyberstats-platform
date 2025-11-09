'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Target, Search } from 'lucide-react'
import categoryOverrides from '@/data/category-overrides.json'

interface CategoryOverride {
  slug: string
  customDescription?: string
}

export default function ManageCategoriesPage() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingCategories, setLoadingCategories] = useState(true)

  useEffect(() => {
    // Check authentication
    const token = sessionStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
      return
    }
    setAuthenticated(true)
    setLoading(false)

    // Fetch categories from API
    async function fetchCategories() {
      try {
        const apiKey = process.env.NEXT_PUBLIC_API_KEY
        const response = await fetch(
          `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&limit=5000&days=365`
        )
        const data = await response.json()

        if (data && data.items) {
          // Extract unique categories from tags
          const categoryCounts: { [key: string]: number } = {}
          data.items.forEach((item: any) => {
            if (item.tags && Array.isArray(item.tags)) {
              item.tags.forEach((tag: string) => {
                categoryCounts[tag] = (categoryCounts[tag] || 0) + 1
              })
            }
          })

          const categoryList = Object.entries(categoryCounts).map(([name, count]) => ({
            name,
            slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            statsCount: count,
            hasOverride: categoryOverrides.some((c: CategoryOverride) => c.slug === name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
          }))

          categoryList.sort((a, b) => a.name.localeCompare(b.name))
          setCategories(categoryList)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [router])

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/admin/dashboard"
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Categories</h1>
          <p className="text-gray-600">Edit category information and add custom descriptions</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-gray-900"
            />
          </div>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loadingCategories ? (
            <div className="p-12 text-center text-gray-600">Loading categories...</div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-12 text-center text-gray-600">
              No categories found matching "{searchQuery}"
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <div key={category.slug} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Target className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                        {category.hasOverride && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                            Customized
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {category.statsCount} statistics • Slug: {category.slug}
                      </p>
                    </div>
                    <Link
                      href={`/admin/dashboard/categories/edit/${category.slug}`}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Message */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">How to customize categories</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Click "Edit" on any category to add custom information</li>
            <li>• The form will generate JSON that you copy to <code className="bg-blue-100 px-1 py-0.5 rounded">/src/data/category-overrides.json</code></li>
            <li>• Custom data will be merged with API data on category pages</li>
            <li>• Changes require redeploying the site</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
