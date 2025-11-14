import { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import VendorDetailClient from './VendorDetailClient'
import Footer from '@/components/Footer'
import { Building2, ChevronRight, Target, Globe, MapPin, Calendar } from 'lucide-react'
import Link from 'next/link'

interface VendorOverride {
  slug: string
  custom_description?: string
  website?: string
  founded?: string
  headquarters?: string
}

interface VendorData {
  vendorName: string
  slug: string
  allStats: any[]
  categories: any[]
  relatedVendors: any[]
  reports: any[]
  vendorOverride: VendorOverride | null
}

interface PageProps {
  params: { slug: string }
}

async function fetchVendorData(slug: string): Promise<VendorData | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY

    // Fetch vendor override data from API
    let vendorOverride: VendorOverride | null = null
    try {
      const vendorRes = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cyberstats.io'}/api/vendors?slug=${slug}`,
        { next: { revalidate: 86400 } }
      )
      const vendorData = await vendorRes.json()
      if (vendorData.data) {
        vendorOverride = vendorData.data
      }
    } catch (error) {
      console.error('Failed to fetch vendor override:', error)
    }

    // Fetch all stats with server-side caching (use smaller limit during build to prevent timeouts)
    const limit = process.env.NODE_ENV === 'production' ? 5000 : 10000
    const response = await fetch(
      `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&limit=${limit}`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    )
    const data = await response.json()

    if (!data || !data.items || !Array.isArray(data.items)) {
      return null
    }

    // Find all stats for this vendor by matching slug
    const allVendorStats = data.items.filter((item: any) => {
      if (!item.publisher) return false
      const itemSlug = item.publisher.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      return itemSlug === slug
    })

    if (allVendorStats.length === 0) {
      return null
    }

    const vendorName = allVendorStats[0].publisher

    // Extract categories from tags (using all stats)
    const categoryMap: { [key: string]: number } = {}
    allVendorStats.forEach((stat: any) => {
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

    // Find related vendors (vendors with similar category tags)
    const allVendorsMap: { [key: string]: { stats: any[], tags: Set<string> } } = {}
    data.items.forEach((item: any) => {
      if (item.publisher && item.publisher !== vendorName) {
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
    allVendorStats.forEach((stat: any) => {
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

    // Extract unique reports by source_name (using all stats)
    const reportsMap = new Map()
    allVendorStats.forEach((stat: any) => {
      if (stat.source_name && stat.link && !reportsMap.has(stat.source_name)) {
        reportsMap.set(stat.source_name, {
          title: stat.source_name.replace('.html', '').replace(/_/g, ' '),
          link: stat.link,
          published_on: stat.published_on || stat.created_at,
          stats_count: allVendorStats.filter((s: any) => s.source_name === stat.source_name).length
        })
      }
    })

    const uniqueReports = Array.from(reportsMap.values())
      .sort((a, b) => new Date(b.published_on).getTime() - new Date(a.published_on).getTime())
      .slice(0, 10)

    return {
      vendorName,
      slug,
      allStats: allVendorStats,
      categories: topCategories,
      relatedVendors: topRelated,
      reports: uniqueReports,
      vendorOverride
    }
  } catch (error) {
    console.error('Error fetching vendor data:', error)
    return null
  }
}

// DISABLED: Build timeouts - pages now generate on-demand via ISR
// Pages are cached for 24 hours after first visit (see revalidate in fetchVendorData)
export async function generateStaticParams() {
  return []

  // ORIGINAL CODE (causes 60s timeouts during build):
  // try {
  //   const apiKey = process.env.NEXT_PUBLIC_API_KEY
  //   // Use smaller limit during build to prevent timeouts
  //   const limit = process.env.NODE_ENV === 'production' ? 3000 : 10000
  //   const response = await fetch(
  //     `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&limit=${limit}`,
  //     { cache: 'no-store' } // Don't cache - response is too large (>2MB)
  //   )
  //   const data = await response.json()
  //
  //   if (!data || !data.items || !Array.isArray(data.items)) {
  //     console.error('Invalid API response for generateStaticParams:', data)
  //     return []
  //   }
  //
  //   // Extract all unique vendor slugs from publishers and count stats per vendor
  //   const vendorStats = new Map<string, number>()
  //   data.items.forEach((item: any) => {
  //     if (item.publisher) {
  //       const slug = item.publisher.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  //       if (slug) {
  //         vendorStats.set(slug, (vendorStats.get(slug) || 0) + 1)
  //       }
  //     }
  //   })
  //
  //   // Only pre-generate top 50 vendors to stay under 45min build limit
  //   // Less active vendors will be generated on-demand
  //   const topVendors = Array.from(vendorStats.entries())
  //     .sort((a, b) => b[1] - a[1]) // Sort by stat count
  //     .slice(0, 50) // Top 50 only
  //     .map(([slug]) => slug)
  //
  //   console.log(`Pre-generating top 50 of ${vendorStats.size} vendor pages...`)
  //   return topVendors.map(slug => ({ slug }))
  // } catch (error) {
  //   console.error('Error in generateStaticParams for vendors:', error)
  //   return []
  // }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const vendorData = await fetchVendorData(params.slug)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cyberstats.io'

  if (!vendorData) {
    return {
      title: 'Vendor Not Found | Cyberstats',
      description: 'The requested vendor could not be found.'
    }
  }

  // Create a meaningful description (minimum 50 chars for Google)
  const baseDescription = vendorData.vendorOverride?.custom_description ||
    `Explore ${vendorData.allStats.length} cybersecurity reports and statistics published by ${vendorData.vendorName}. Coverage includes ${vendorData.categories.slice(0, 3).map(c => c.name).join(', ')} and more.`
  const pageDescription = baseDescription.length >= 50
    ? baseDescription.substring(0, 160)
    : `${baseDescription} Updated regularly.`.substring(0, 160)
  const pageTitle = `${vendorData.vendorName} Statistics | Cyberstats`

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `${baseUrl}/vendors/${params.slug}`,
      type: 'website',
      siteName: 'Cyberstats'
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription
    },
    keywords: `${vendorData.vendorName}, cybersecurity vendor, security statistics, ${vendorData.categories.slice(0, 3).map(c => c.name).join(', ')}`
  }
}

export default async function VendorDetailPage({ params }: PageProps) {
  const vendorData = await fetchVendorData(params.slug)

  if (!vendorData) {
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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cyberstats.io'
  const pageUrl = `${baseUrl}/vendors/${params.slug}`
  const pageDescription = vendorData.vendorOverride?.custom_description || `Cybersecurity reports and statistics published by ${vendorData.vendorName}`

  // Organization structured data for the vendor
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: vendorData.vendorName,
    url: vendorData.vendorOverride?.website || pageUrl,
    description: pageDescription,
    ...(vendorData.vendorOverride?.founded && { foundingDate: vendorData.vendorOverride.founded }),
    ...(vendorData.vendorOverride?.headquarters && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: vendorData.vendorOverride.headquarters
      }
    })
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
        name: 'Vendors',
        item: `${baseUrl}/vendors`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: vendorData.vendorName,
        item: pageUrl
      }
    ]
  }

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
            <Link href="/vendors" className="hover:text-green-600">Vendors</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{vendorData.vendorName}</span>
          </div>

          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-start space-x-4">
              <div className="p-4 bg-green-100 rounded-xl">
                <Building2 className="w-10 h-10 text-green-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{vendorData.vendorName}</h1>

                {/* Custom Description */}
                <p className="text-gray-600 mb-3">{pageDescription}</p>

                {/* Vendor Details */}
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm">
                  {vendorData.vendorOverride?.website && (
                    <a
                      href={vendorData.vendorOverride.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-green-600 hover:text-green-700 font-medium"
                    >
                      <Globe className="w-4 h-4 mr-1" />
                      Visit Website
                    </a>
                  )}
                  {vendorData.vendorOverride?.founded && (
                    <span className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      Founded {vendorData.vendorOverride.founded}
                    </span>
                  )}
                  {vendorData.vendorOverride?.headquarters && (
                    <span className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {vendorData.vendorOverride.headquarters}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-4 mt-3 text-sm">
                  <span className="flex items-center text-gray-500">
                    <Target className="w-4 h-4 mr-1" />
                    {vendorData.categories.length} categories
                  </span>
                  <span className="flex items-center text-gray-500">
                    <Building2 className="w-4 h-4 mr-1" />
                    {vendorData.reports.length} reports
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Client-side component handles time period filtering and display */}
          <VendorDetailClient vendorData={vendorData} />
        </div>

        <Footer />
      </div>
    </>
  )
}
