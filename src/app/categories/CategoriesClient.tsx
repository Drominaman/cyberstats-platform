'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Target, Shield, Cloud, Network, Lock, Eye, AlertTriangle, Database, Workflow, Globe, Search, FileText } from 'lucide-react'

interface Category {
  name: string
  slug: string
  icon: string
  description: string
  statsCount: number
  trend: 'rising' | 'stable' | 'declining'
  keywords: string[]
}

interface CategoriesClientProps {
  categories: Category[]
}

// Icon mapping
const iconMap: { [key: string]: any } = {
  Target,
  Shield,
  Cloud,
  Network,
  Lock,
  Eye,
  AlertTriangle,
  Database,
  Workflow,
  Globe
}

export default function CategoriesClient({ categories }: CategoriesClientProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get top 6 categories by statsCount
  const topCategories = [...categories]
    .sort((a, b) => b.statsCount - a.statsCount)
    .slice(0, 6)

  // Get remaining categories (exclude top 6)
  const topSlugs = new Set(topCategories.map(cat => cat.slug))
  const remainingCategories = filteredCategories.filter(cat => !topSlugs.has(cat.slug))

  return (
    <>
      {/* Search */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-gray-900"
          />
        </div>
      </div>

      {!searchQuery && (
        <>
          {/* Featured Top Categories */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {topCategories.map((category) => {
                const IconComponent = iconMap[category.icon] || Target

                return (
                  <Link
                    key={category.slug}
                    href={`/categories/${category.slug}`}
                    className="group bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-md border-2 border-purple-200 p-8 hover:shadow-xl hover:border-purple-400 transition-all duration-200"
                  >
                    <div className="mb-6">
                      <div className="p-4 bg-white rounded-xl group-hover:bg-purple-100 transition-colors inline-block shadow-sm">
                        <IconComponent className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                      {category.name}
                    </h3>

                    <p className="text-sm text-gray-700 mb-4">
                      Cybersecurity statistics about {category.name.toLowerCase()}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-purple-200">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">{category.statsCount} stats</span>
                      </div>
                      <span className="text-purple-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                        Explore →
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* All Other Categories */}
          {remainingCategories.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">All Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {remainingCategories.map((category) => {
                  const IconComponent = iconMap[category.icon] || Target

                  return (
                    <Link
                      key={category.slug}
                      href={`/categories/${category.slug}`}
                      className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all duration-200"
                    >
                      <div className="mb-4">
                        <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors inline-block">
                          <IconComponent className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                        {category.name}
                      </h3>

                      <p className="text-sm text-gray-600 mb-4">
                        Cybersecurity statistics about {category.name.toLowerCase()}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-500">{category.statsCount} stats</span>
                        <span className="text-purple-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                          Explore →
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Search Results */}
      {searchQuery && (
        <>
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredCategories.map((category) => {
                const IconComponent = iconMap[category.icon] || Target

                return (
                  <Link
                    key={category.slug}
                    href={`/categories/${category.slug}`}
                    className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all duration-200"
                  >
                    <div className="mb-4">
                      <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors inline-block">
                        <IconComponent className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      {category.name}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4">
                      Cybersecurity statistics about {category.name.toLowerCase()}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-500">{category.statsCount} stats</span>
                      <span className="text-purple-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                        Explore →
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center mb-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No categories found matching &ldquo;{searchQuery}&rdquo;</p>
            </div>
          )}
        </>
      )}
    </>
  )
}
