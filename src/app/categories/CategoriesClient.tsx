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

  return (
    <>
      {/* Search */}
      <div className="max-w-2xl mx-auto mb-8">
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

      {/* Categories Grid */}
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

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {category.description}
                </p>

                <div className="flex items-center justify-end pt-4 border-t border-gray-100">
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
  )
}
