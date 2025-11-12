import { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import CategoryDetailClient from './CategoryDetailClient'
import Footer from '@/components/Footer'
import { Target, Tag, Building2 } from 'lucide-react'
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

interface PageProps {
  params: { slug: string }
}

async function fetchCategoryData(slug: string): Promise<CategoryData | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY

    // Fetch stats for this category with server-side caching (all historical data)
    const response = await fetch(
      `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&limit=10000`,
      { next: { revalidate: 86400 } } // Cache for 24 hours - NOW THIS WORKS!
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

    // Find related categories
    const tagCounts: { [key: string]: number } = {}
    const currentCategoryLower = categoryName.toLowerCase()

    data.items.forEach((item: any) => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag: string) => {
          const tagLower = tag.toLowerCase()
          const tagSlug = tagLower.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

          if (tagSlug !== slug && (
            tagLower.includes(currentCategoryLower) ||
            (item.tags.some((t: string) => t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === slug))
          )) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          }
        })
      }
    })

    const relatedCategories = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        count
      }))

    return {
      name: categoryName,
      slug,
      stats: categoryStats,
      topVendors,
      relatedCategories
    }
  } catch (error) {
    console.error('Error fetching category data:', error)
    return null
  }
}

// Pre-generate all category pages at build time
export async function generateStaticParams() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY
    const response = await fetch(
      `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&limit=10000`,
      { cache: 'no-store' } // Don't cache - response is too large (>2MB)
    )
    const data = await response.json()

    if (!data || !data.items || !Array.isArray(data.items)) {
      console.error('Invalid API response for generateStaticParams:', data)
      return []
    }

    // Extract all unique category slugs from tags and count stats per category
    const categoryStats = new Map<string, number>()
    data.items.forEach((item: any) => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag: string) => {
          const slug = tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          if (slug) {
            categoryStats.set(slug, (categoryStats.get(slug) || 0) + 1)
          }
        })
      }
    })

    // Pre-generate top 300 categories to stay under 45min build limit
    // Less popular categories will be generated on-demand
    const topCategories = Array.from(categoryStats.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by stat count
      .slice(0, 300) // Top 300
      .map(([slug]) => slug)

    console.log(`Pre-generating top 300 of ${categoryStats.size} category pages...`)
    return topCategories.map(slug => ({ slug }))
  } catch (error) {
    console.error('Error in generateStaticParams for categories:', error)
    return []
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const categoryData = await fetchCategoryData(params.slug)
  const categoryOverride = categoryOverrides.find((c: CategoryOverride) => c.slug === params.slug)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cyberstats.io'

  if (!categoryData) {
    return {
      title: 'Topic Not Found | Cyberstats',
      description: 'The requested topic could not be found.'
    }
  }

  // Create a meaningful description (minimum 50 chars for Google)
  const baseDescription = categoryOverride?.customDescription ||
    `Explore ${categoryData.stats.length} cybersecurity statistics about ${categoryData.name.toLowerCase()}. Published by leading vendors including ${categoryData.topVendors.slice(0, 3).map(v => v.name).join(', ')}.`
  const pageDescription = baseDescription.length >= 50
    ? baseDescription.substring(0, 160)
    : `${baseDescription} Updated regularly with latest research.`.substring(0, 160)
  const pageTitle = `${categoryData.name} Statistics | Cyberstats`

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `${baseUrl}/categories/${params.slug}`,
      type: 'website',
      siteName: 'Cyberstats'
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription
    },
    keywords: `${categoryData.name}, cybersecurity statistics, ${categoryData.topVendors.slice(0, 3).map(v => v.name).join(', ')}`
  }
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const categoryData = await fetchCategoryData(params.slug)
  const categoryOverride = categoryOverrides.find((c: CategoryOverride) => c.slug === params.slug)

  if (!categoryData) {
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
  const pageUrl = `${baseUrl}/categories/${params.slug}`
  const pageDescription = categoryOverride?.customDescription || `Cybersecurity statistics about ${categoryData.name.toLowerCase()}`

  // Dataset structured data
  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${categoryData.name} Statistics`,
    description: pageDescription,
    url: pageUrl,
    keywords: [categoryData.name, 'cybersecurity', 'statistics', 'security'],
    creator: {
      '@type': 'Organization',
      name: 'Cyberstats',
      url: baseUrl
    },
    temporalCoverage: new Date().getFullYear().toString(),
    distribution: categoryData.stats.slice(0, 10).map((stat) => ({
      '@type': 'DataDownload',
      encodingFormat: 'text/html',
      contentUrl: stat.link,
      name: stat.title,
      datePublished: stat.created_at
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
        item: pageUrl
      }
    ]
  }

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
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

          {/* Related Topics and Vendors Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Related Categories */}
            {categoryData.relatedCategories && categoryData.relatedCategories.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Tag className="w-5 h-5 mr-2 text-purple-600" />
                  Related Topics
                </h2>
                <div className="space-y-2">
                  {categoryData.relatedCategories.slice(0, 6).map((category) => (
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

            {/* Top Vendors */}
            {categoryData.topVendors && categoryData.topVendors.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-green-600" />
                  Top Vendors
                </h2>
                <div className="space-y-2">
                  {categoryData.topVendors.slice(0, 6).map((vendor) => {
                    const vendorSlug = vendor.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                    return (
                      <Link
                        key={vendorSlug}
                        href={`/vendors/${vendorSlug}`}
                        className="flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                      >
                        <span className="text-sm font-medium text-gray-900 group-hover:text-green-700">
                          {vendor.name}
                        </span>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                          {vendor.count}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Client-side component handles pagination and display */}
          <CategoryDetailClient categoryData={categoryData} />
        </div>

        <Footer />
      </div>
    </>
  )
}
