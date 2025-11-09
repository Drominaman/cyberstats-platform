import { notFound } from 'next/navigation'
import Navigation from '@/components/Navigation'
import CategoryDetailClient from './CategoryDetailClient'
import Footer from '@/components/Footer'
import { Target } from 'lucide-react'
import categoryOverrides from '@/data/category-overrides.json'

// Static generation - pages built once and cached permanently

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

async function fetchCategoryData(slug: string): Promise<CategoryData | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY

    // Fetch all stats
    const response = await fetch(
      `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&limit=5000&days=365`
    )
    const data = await response.json()

    if (!data || !data.items || !Array.isArray(data.items)) {
      return null
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
      return null
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

    return {
      name: categoryName,
      slug,
      stats: categoryStats,
      topVendors
    }
  } catch (error) {
    console.error('Error fetching category data:', error)
    return null
  }
}

export default async function CategoryDetailPage({ params }: { params: { slug: string } }) {
  const categoryData = await fetchCategoryData(params.slug)

  if (!categoryData) {
    notFound()
  }

  // Find category override data
  const categoryOverride = categoryOverrides.find((c: CategoryOverride) => c.slug === params.slug)

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
            {categoryOverride?.customDescription || `Market intelligence and statistics for ${categoryData.name}`}
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
