import Link from 'next/link'
import Navigation from '@/components/Navigation'
import HomeClient from './HomeClient'
import MinimalGhostEmbed from '@/components/MinimalGhostEmbed'
import Footer from '@/components/Footer'
import { BarChart3, TrendingUp, Building2, Target } from 'lucide-react'

// ISR: Homepage cached for 1 hour after generation
export const revalidate = 3600

// Helper to create URL-safe slug from title
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

async function fetchHomeData() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY

    // Fetch stats from past 90 days for random display
    const recentResponse = await fetch(
      `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&limit=500&days=90`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )
    const recentData = await recentResponse.json()

    let randomStats: any[] = []
    if (recentData.items && recentData.items.length > 0) {
      // Randomly select 10 stats from the past 90 days
      const shuffled = [...recentData.items].sort(() => Math.random() - 0.5)
      randomStats = shuffled.slice(0, 10)
    }

    // Fetch data for top vendors/categories - increased to 10000 for complete data
    const allResponse = await fetch(
      `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&limit=10000`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )
    const allData = await allResponse.json()

    let topVendors: any[] = []
    let topCategories: any[] = []

    if (allData.items && Array.isArray(allData.items)) {
      // Calculate vendors
      const vendorCounts: { [key: string]: number } = {}
      const categoryCounts: { [key: string]: number } = {}

      allData.items.forEach((item: any) => {
        if (item.publisher) {
          vendorCounts[item.publisher] = (vendorCounts[item.publisher] || 0) + 1
        }
        if (item.tags) {
          item.tags.forEach((tag: string) => {
            categoryCounts[tag] = (categoryCounts[tag] || 0) + 1
          })
        }
      })

      // Top vendors
      topVendors = Object.entries(vendorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, count]) => ({
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          count
        }))

      // Top categories
      topCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, count]) => ({
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          count
        }))
    }

    return {
      stats: randomStats,
      topVendors,
      topCategories
    }
  } catch (error) {
    console.error('Failed to fetch home data:', error)
    return {
      stats: [],
      topVendors: [],
      topCategories: []
    }
  }
}

export default async function Home() {
  const data = await fetchHomeData()

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cybersecstatistics.com'

  // WebSite schema with SearchAction for SEO
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Cyberstats',
    url: baseUrl,
    description: 'The largest directory of curated cybersecurity statistics on the web',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }

  // BreadcrumbList structured data for SEO
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl
      }
    ]
  }

  // ItemList for top categories
  const categoryListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Popular Cybersecurity Topics',
    itemListElement: data.topCategories.map((category, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${baseUrl}/categories/${category.slug}`,
      name: category.name
    }))
  }

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryListSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 animate-pulse">
            <BarChart3 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Cybersecurity Statistics
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The largest directory of curated cybersecurity statistics on the web
          </p>

          {/* Search Bar - Client Component */}
          <HomeClient />
        </div>

        {/* Newsletter Signup */}
        <div className="mb-12 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Get Weekly Insights</h3>
          <p className="text-gray-600 text-center mb-6">Latest cybersecurity stats delivered to your inbox every week</p>
          <MinimalGhostEmbed />
        </div>

        {/* Quick Access - Top Vendors & Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Top Vendors */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-green-500" />
                Top Vendors
              </h3>
              <Link href="/vendors" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                View all →
              </Link>
            </div>
            <div className="space-y-2">
              {data.topVendors.map((vendor, i) => (
                <Link
                  key={i}
                  href={`/vendors/${vendor.slug}`}
                  className="flex items-center p-3 rounded-lg hover:bg-green-50 transition-colors group"
                >
                  <span className="font-medium text-gray-900 group-hover:text-green-600">{vendor.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Topics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Target className="w-5 h-5 mr-2 text-purple-500" />
                Popular Topics
              </h3>
              <Link href="/categories" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                View all →
              </Link>
            </div>
            <div className="space-y-2">
              {data.topCategories.map((category, i) => (
                <Link
                  key={i}
                  href={`/categories/${category.slug}`}
                  className="flex items-center p-3 rounded-lg hover:bg-purple-50 transition-colors group"
                >
                  <span className="font-medium text-gray-900 group-hover:text-purple-600">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-12">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
              Latest Statistics
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {data.stats.map((stat, index) => (
              <Link
                key={index}
                href={`/stats/${createSlug(stat.title)}`}
                className="block px-6 py-4 hover:bg-blue-50 transition-colors group"
              >
                <p className="text-gray-900 mb-2 group-hover:text-blue-600 font-medium">{stat.title}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded font-semibold text-xs">
                    {new Date(stat.created_at).getFullYear()}
                  </span>
                  <span className="flex items-center">
                    <Building2 className="w-3 h-3 mr-1" />
                    {stat.publisher}
                  </span>
                  <span>•</span>
                  <span>{new Date(stat.created_at).toLocaleDateString('en-US')}</span>
                  {stat.tags && stat.tags.length > 0 && (
                    <>
                      <span>•</span>
                      <div className="flex gap-2">
                        {stat.tags.slice(0, 3).map((tag: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Newsletter Banner */}
        <div className="mt-12 mb-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Never Miss a Security Trend</h3>
          <p className="text-gray-600 text-center mb-6">Join 1,000+ security professionals getting weekly insights</p>
          <MinimalGhostEmbed />
        </div>

        {/* Features Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="p-3 bg-blue-600 rounded-lg w-fit mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Real-Time Trends</h3>
            <p className="text-gray-700 text-sm">
              Track search interest and market momentum for cybersecurity topics and vendors using Google Trends data.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="p-3 bg-green-600 rounded-lg w-fit mb-4">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Vendor Intelligence</h3>
            <p className="text-gray-700 text-sm">
              Discover market statistics, reports, and trends for cybersecurity vendors and solution providers.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="p-3 bg-purple-600 rounded-lg w-fit mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Category Analysis</h3>
            <p className="text-gray-700 text-sm">
              Explore market intelligence across solution categories from XDR to Zero Trust.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
    </>
  )
}
