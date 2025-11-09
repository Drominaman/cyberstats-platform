'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import CategoryDetailClient from './CategoryDetailClient'
import Footer from '@/components/Footer'
import { Target, Loader } from 'lucide-react'
import categoryOverrides from '@/data/category-overrides.json'

interface CategoryData {
  name: string
  slug: string
  stats: any[]
  topVendors: { name: string; count: number }[]
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

      setCategoryData({
        name: categoryName,
        slug,
        stats: categoryStats,
        topVendors
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
              <p className="text-gray-600">Loading category data...</p>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
            <p className="text-gray-600 mb-4">The requested category could not be found.</p>
            <a href="/categories" className="text-purple-600 hover:text-purple-700">
              ← Back to Categories
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

        {/* Client-side component handles pagination and display */}
        <CategoryDetailClient
          categoryData={categoryData}
        />
      </div>

      <Footer />
    </div>
  )
}
