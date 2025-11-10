'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import CategoryDetailClient from './CategoryDetailClient'
import Footer from '@/components/Footer'
import { Target, Loader, Tag } from 'lucide-react'
import Link from 'next/link'
import categoryOverrides from '@/data/category-overrides.json'

interface CategoryData {
  name: string
  slug: string
  stats: any[]
  topVendors: { name: string; count: number }[]
  relatedCategories: { name: string; slug: string; count: number }[]
}

interface CategoryOverride {
  slug: string
  customDescription?: string
}

export default function CategoryDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [categoryData, setCategoryData] = useState<CategoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchCategoryData()
  }, [slug])

  async function fetchCategoryData() {
    try {
      const apiKey = process.env.NEXT_PUBLIC_API_KEY

      // Fetch all stats
      const response = await fetch(
        `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&limit=5000&days=365`
      )
      const data = await response.json()

      if (!data || !data.items || !Array.isArray(data.items)) {
        setError(true)
        setLoading(false)
        return
      }

      // Find the category name from tags
      let categoryName = ''
      const categoryStats: any[] = []

      data.items.forEach((item: any) => {
        if (item.tags && Array.isArray(item.tags)) {
          item.tags.forEach((tag: string) => {
            const tagSlug = tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            if (tagSlug === slug) {
              categoryName = tag
              categoryStats.push(item)
            }
          })
        }
      })

      if (!categoryName) {
        setError(true)
        setLoading(false)
        return
      }

      // Calculate top vendors for this category
      const vendorCounts: { [key: string]: number } = {}
      categoryStats.forEach((stat) => {
        if (stat.publisher) {
          vendorCounts[stat.publisher] = (vendorCounts[stat.publisher] || 0) + 1
        }
      })

      const topVendors = Object.entries(vendorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }))

      // Find related categories (tags that contain the current category name or are frequently used together)
      const tagCounts: { [key: string]: number } = {}
      const currentCategoryLower = categoryName.toLowerCase()

      data.items.forEach((item: any) => {
        if (item.tags && Array.isArray(item.tags)) {
          item.tags.forEach((tag: string) => {
            const tagLower = tag.toLowerCase()
            const tagSlug = tagLower.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

            // Include tags that:
            // 1. Contain the current category name (e.g., "AI Security" for "AI")
            // 2. Or are frequently used in stats with this category
            if (tagSlug !== slug && (
              tagLower.includes(currentCategoryLower) ||
              (item.tags.some((t: string) => t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === slug))
            )) {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1
            }
          })
        }
      })

      // Get top 8 related categories
      const relatedCategories = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          count
        }))

      setCategoryData({
        name: categoryName,
        slug,
        stats: categoryStats,
        topVendors,
        relatedCategories
      })
      setLoading(false)
    } catch (error) {
      console.error('Error fetching category data:', error)
      setError(true)
      setLoading(false)
    }
  }

  // Find category override data
  const categoryOverride = categoryOverrides.find((c: CategoryOverride) => c.slug === slug)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex items-center justify-center">
            <div className="text-center">
              <Loader className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Loading topic data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !categoryData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Topic Not Found</h1>
            <p className="text-gray-600 mb-4">The requested topic could not be found.</p>
            <a href="/categories" className="text-purple-600 hover:text-purple-700">
              ← Back to Topics
            </a>
          </div>
        </div>
      </div>
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cyberstats.io'

  // ItemList structured data for the stats in this category
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${categoryData.name} Statistics`,
    numberOfItems: categoryData.stats.length,
    itemListElement: categoryData.stats.slice(0, 10).map((stat, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Article',
        name: stat.title,
        datePublished: stat.created_at,
        author: {
          '@type': 'Organization',
          name: stat.publisher
        }
      }
    }))
  }

  // BreadcrumbList for navigation
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Topics',
        item: `${baseUrl}/categories`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryData.name,
        item: `${baseUrl}/categories/${slug}`
      }
    ]
  }

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-purple-600">Home</Link>
            <span>›</span>
            <Link href="/categories" className="hover:text-purple-600">Topics</Link>
            <span>›</span>
            <span className="text-gray-900">{categoryData.name}</span>
          </div>

          {/* Header */}
          <div className="mb-8">
          <div className="inline-block p-3 bg-purple-100 rounded-2xl mb-4">
            <Target className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {categoryData.name}
          </h1>
          <p className="text-xl text-gray-600">
            {categoryOverride?.customDescription || `Cybersecurity statistics about ${categoryData.name.toLowerCase()}`}
          </p>
        </div>

        {/* Related Categories */}
        {categoryData.relatedCategories && categoryData.relatedCategories.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Tag className="w-5 h-5 mr-2 text-purple-600" />
              Related Topics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {categoryData.relatedCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  className="flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                >
                  <span className="text-sm font-medium text-gray-900 group-hover:text-purple-700">
                    {category.name}
                  </span>
                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                    {category.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Client-side component handles pagination and display */}
        <CategoryDetailClient
          categoryData={categoryData}
        />
      </div>

      <Footer />
    </div>
    </>
  )
}
