import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'
import CategoryDetailClient from './CategoryDetailClient'
import CategoriesClient from '../CategoriesClient'
import Footer from '@/components/Footer'
import { Target, Tag, Building2, Layers } from 'lucide-react'
import Link from 'next/link'
import categoryOverrides from '@/data/category-overrides.json'
import categoryTaxonomy from '@/data/category-taxonomy.json'

interface CategoryData {
  name: string
  slug: string
  fullPath: string
  stats: any[]
  topVendors: { name: string; count: number }[]
  relatedCategories: { name: string; slug: string; fullPath: string; count: number }[]
  subcategories?: { name: string; slug: string; fullPath: string; count: number }[]
  parent?: { name: string; slug: string; fullPath: string }
  isParent: boolean
}

interface CategoryOverride {
  slug: string
  customDescription?: string
}

interface PageProps {
  params: { slug?: string[] }
}

interface Category {
  name: string
  slug: string
  icon: string
  description: string
  statsCount: number
  trend: 'rising' | 'stable' | 'declining'
  keywords: string[]
}

// Icon mapping based on category keywords
function getCategoryIconName(name: string): string {
  const nameLower = name.toLowerCase()
  if (nameLower.includes('xdr')) return 'Target'
  if (nameLower.includes('edr') || nameLower.includes('endpoint')) return 'Shield'
  if (nameLower.includes('ndr') || nameLower.includes('network')) return 'Network'
  if (nameLower.includes('siem') || nameLower.includes('log')) return 'Database'
  if (nameLower.includes('cloud')) return 'Cloud'
  if (nameLower.includes('zero trust') || nameLower.includes('ztna') || nameLower.includes('access') || nameLower.includes('iam')) return 'Lock'
  if (nameLower.includes('threat') || nameLower.includes('intelligence')) return 'Eye'
  if (nameLower.includes('vulnerability') || nameLower.includes('cve')) return 'AlertTriangle'
  if (nameLower.includes('application') || nameLower.includes('devsecops')) return 'Workflow'
  if (nameLower.includes('waf') || nameLower.includes('firewall') || nameLower.includes('api')) return 'Globe'
  return 'Target' // default
}

async function fetchCategories(): Promise<Category[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY
    // Fetch all stats for accurate category counting (2127 categories total)
    const limit=10000
    const response = await fetch(
      `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&limit=${limit}`,
      { next: { revalidate: 86400 } }
    )
    const data = await response.json()

    if (!data || !data.items || !Array.isArray(data.items)) {
      console.error('Invalid API response:', data)
      return []
    }

    // Extract all tags and count their occurrences
    const tagCounts: { [key: string]: number } = {}
    data.items.forEach((item: any) => {
      if (item.tags) {
        item.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }
    })

    // Convert to categories array and sort alphabetically
    const extractedCategories: Category[] = Object.entries(tagCounts)
      .filter(([name, count]) => count >= 3)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        icon: getCategoryIconName(name),
        description: `Cybersecurity statistics about ${name.toLowerCase()}`,
        statsCount: count,
        trend: 'stable' as const,
        keywords: [name]
      }))

    return extractedCategories
  } catch (error) {
    console.error('Failed to fetch category counts:', error)
    return []
  }
}

// Helper to check if a single-level slug should redirect to hierarchical path
function shouldRedirectToHierarchical(slug: string): string | null {
  const taxonomy = categoryTaxonomy.categories

  // Check if this slug is a subcategory (or synonym) in the taxonomy
  for (const parent of taxonomy) {
    for (const subcat of parent.subcategories) {
      // Check if slug matches the subcategory or any of its synonyms
      if (subcat.slug === slug || (subcat.synonyms && subcat.synonyms.includes(slug))) {
        return `/categories/${parent.slug}/${subcat.slug}`
      }
    }
  }

  return null
}

// Helper to find category in taxonomy
function findCategoryInTaxonomy(slugPath: string[]) {
  const taxonomy = categoryTaxonomy.categories

  if (slugPath.length === 1) {
    // Looking for parent category
    const parent = taxonomy.find(c => c.slug === slugPath[0])
    return parent ? { type: 'parent' as const, category: parent, parent: null } : null
  } else if (slugPath.length === 2) {
    // Looking for subcategory
    const parent = taxonomy.find(c => c.slug === slugPath[0])
    if (!parent) return null

    const subcategory = parent.subcategories.find(s => s.slug === slugPath[1])
    return subcategory ? { type: 'child' as const, category: subcategory, parent } : null
  }

  return null
}

// Helper to get all tag slugs that should match this category (including synonyms)
function getMatchingSlugs(categorySlug: string, parentSlug?: string): string[] {
  const taxonomy = categoryTaxonomy.categories
  const slugs = [categorySlug]

  if (parentSlug) {
    // This is a subcategory - find synonyms
    const parent = taxonomy.find(c => c.slug === parentSlug)
    if (parent) {
      const subcat = parent.subcategories.find(s => s.slug === categorySlug)
      if (subcat && subcat.synonyms) {
        slugs.push(...subcat.synonyms)
      }
    }
  } else {
    // This is a parent - check if it has synonyms
    const parent = taxonomy.find(c => c.slug === categorySlug)
    if (parent?.subcategories) {
      // For parents, we don't include synonyms, just the exact slug
      // Users should navigate to subcategories instead
    }
  }

  return slugs
}

// Helper to convert slug to title case tag name (e.g., "dating-platforms" → "Dating Platforms")
function slugToTagName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

async function fetchCategoryData(slugPath: string[]): Promise<CategoryData | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY
    const categorySlug = slugPath[slugPath.length - 1]
    const parentSlug = slugPath.length === 2 ? slugPath[0] : undefined

    // Find in taxonomy
    const taxonomyResult = findCategoryInTaxonomy(slugPath)
    let categoryName = taxonomyResult ? taxonomyResult.category.name : ''

    // If not in taxonomy, convert slug to proper tag name (e.g., "dating-platforms" → "Dating Platforms")
    const tagQueryName = categoryName || slugToTagName(categorySlug)

    // Get matching slugs (including synonyms)
    const matchingSlugs = getMatchingSlugs(categorySlug, parentSlug)

    // Fetch stats for this category using server-side filtering (tag indexes)
    // Use the proper tag name (not slug) for the API query
    const response = await fetch(
      `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&tag=${encodeURIComponent(tagQueryName)}&limit=1000`,
      { next: { revalidate: 86400 } }
    )
    const data = await response.json()

    if (!data || !data.items || !Array.isArray(data.items)) {
      return null
    }

    const categoryStats = data.items

    // Extract exact category name from first stat's tags if we don't have it from taxonomy
    // This ensures we get the exact capitalization from the database
    if (!categoryName && categoryStats.length > 0) {
      const firstStat = categoryStats[0]
      if (firstStat.tags && Array.isArray(firstStat.tags)) {
        for (const tag of firstStat.tags) {
          const tagSlug = tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          if (tagSlug === categorySlug) {
            categoryName = tag // Use the exact tag name from database
            break
          }
        }
      }
    }

    // If still no categoryName (no stats found), use the converted tag name
    if (!categoryName) {
      categoryName = tagQueryName
    }

    // If no stats found and category doesn't exist in any form, return null
    if (categoryStats.length === 0) {
      return null
    }

    // Calculate top vendors
    const vendorCounts: { [key: string]: number } = {}
    categoryStats.forEach((stat: any) => {
      if (stat.publisher) {
        vendorCounts[stat.publisher] = (vendorCounts[stat.publisher] || 0) + 1
      }
    })

    const topVendors = Object.entries(vendorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))

    // Fetch broader sample for computing related categories and subcategories
    const broaderResponse = await fetch(
      `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&limit=1000`,
      { next: { revalidate: 86400 } }
    )
    const broaderData = await broaderResponse.json()

    // Find related categories (from same parent or tags)
    const tagCounts: { [key: string]: number } = {}
    const currentCategoryLower = categoryName.toLowerCase()

    if (broaderData && broaderData.items) {
      broaderData.items.forEach((item: any) => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag: string) => {
          const tagSlug = tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

          if (!matchingSlugs.includes(tagSlug) && (
            tag.toLowerCase().includes(currentCategoryLower) ||
            item.tags.some((t: string) => matchingSlugs.includes(t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')))
          )) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          }
        })
      }
    })
    }

    const relatedCategories = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        fullPath: `/categories/${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
        count
      }))

    // Get subcategories if this is a parent
    let subcategories: { name: string; slug: string; fullPath: string; count: number }[] = []
    let parentInfo: { name: string; slug: string; fullPath: string } | undefined

    if (taxonomyResult?.type === 'parent') {
      // Count stats for each subcategory
      subcategories = taxonomyResult.category.subcategories.map(sub => {
        const subSlugs = getMatchingSlugs(sub.slug, categorySlug)
        let count = 0
        const seen = new Set<number>()

        if (broaderData && broaderData.items) {
          broaderData.items.forEach((item: any) => {
            if (item.tags && Array.isArray(item.tags)) {
              item.tags.forEach((tag: string) => {
                const tagSlug = tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                if (subSlugs.includes(tagSlug) && !seen.has(item.id)) {
                  count++
                  seen.add(item.id)
                }
              })
            }
          })
        }

        return {
          name: sub.name,
          slug: sub.slug,
          fullPath: `/categories/${categorySlug}/${sub.slug}`,
          count
        }
      }).filter(s => s.count > 0) // Only show subcategories with stats
    } else if (taxonomyResult?.type === 'child' && taxonomyResult.parent) {
      // Set parent info for breadcrumbs
      parentInfo = {
        name: taxonomyResult.parent.name,
        slug: taxonomyResult.parent.slug,
        fullPath: `/categories/${taxonomyResult.parent.slug}`
      }
    }

    return {
      name: categoryName,
      slug: categorySlug,
      fullPath: slugPath.join('/'),
      stats: categoryStats,
      topVendors,
      relatedCategories,
      subcategories,
      parent: parentInfo,
      isParent: taxonomyResult?.type === 'parent'
    }
  } catch (error) {
    console.error('Error fetching category data:', error)
    return null
  }
}

// DISABLED: Build timeouts - pages now generate on-demand via ISR
// Pages are cached for 24 hours after first visit (see revalidate: 86400)
export async function generateStaticParams() {
  return []

  // ORIGINAL CODE (causes 60s timeouts during build):
  // const taxonomy = categoryTaxonomy.categories
  // const paths: { slug: string[] }[] = []
  //
  // // Add all parent categories
  // taxonomy.forEach(parent => {
  //   paths.push({ slug: [parent.slug] })
  //
  //   // Add subcategories (all of them for comprehensive coverage)
  //   parent.subcategories.forEach(sub => {
  //     paths.push({ slug: [parent.slug, sub.slug] })
  //   })
  // })
  //
  // console.log(`Pre-generating ${paths.length} hierarchical category pages...`)
  // return paths
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slugPath = params.slug || []
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cyberstats.io'

  // If no slug, return metadata for categories list page
  if (slugPath.length === 0) {
    return {
      title: 'Cybersecurity Topics',
      description: 'Discover trends, market intelligence, and benchmarking data across cybersecurity topics. Track vendor landscape and industry evolution.',
      keywords: ['cybersecurity topics', 'security categories', 'ransomware', 'zero trust', 'XDR', 'EDR', 'SIEM', 'threat intelligence'],
      alternates: {
        canonical: '/categories'
      },
      openGraph: {
        title: 'Cybersecurity Topics | Cyberstats',
        description: 'Discover trends, market intelligence, and benchmarking data across cybersecurity topics.',
        type: 'website',
        images: ['/og-image.png']
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Cybersecurity Topics | Cyberstats',
        description: 'Discover trends, market intelligence, and benchmarking data across cybersecurity topics.',
        images: ['/og-image.png']
      }
    }
  }

  const categoryData = await fetchCategoryData(slugPath)
  const categoryOverride = categoryOverrides.find((c: CategoryOverride) => c.slug === slugPath.join('/'))

  if (!categoryData) {
    return {
      title: 'Topic Not Found | Cyberstats',
      description: 'The requested topic could not be found.'
    }
  }

  const pageUrl = `${baseUrl}/categories/${slugPath.join('/')}`

  // Create description with parent context if subcategory
  let baseDescription = categoryOverride?.customDescription
  if (!baseDescription) {
    if (categoryData.parent) {
      baseDescription = `Explore ${categoryData.stats.length} cybersecurity statistics about ${categoryData.name.toLowerCase()} in ${categoryData.parent.name}. Published by ${categoryData.topVendors.slice(0, 3).map(v => v.name).join(', ')}.`
    } else {
      baseDescription = `Explore ${categoryData.stats.length} cybersecurity statistics about ${categoryData.name.toLowerCase()}. Published by leading vendors including ${categoryData.topVendors.slice(0, 3).map(v => v.name).join(', ')}.`
    }
  }

  const pageDescription = baseDescription.length >= 50
    ? baseDescription.substring(0, 160)
    : `${baseDescription} Updated regularly with latest research.`.substring(0, 160)

  const pageTitle = categoryData.parent
    ? `${categoryData.name} in ${categoryData.parent.name} | Cyberstats`
    : `${categoryData.name} Statistics | Cyberstats`

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: pageUrl,
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
  const slugPath = params.slug || []

  // Check if single-level slug should redirect to hierarchical path
  if (slugPath.length === 1) {
    const redirectPath = shouldRedirectToHierarchical(slugPath[0])
    if (redirectPath) {
      redirect(redirectPath)
    }
  }

  // If no slug, show categories list page
  if (slugPath.length === 0) {
    const categories = await fetchCategories()

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block p-3 bg-purple-100 rounded-2xl mb-4">
              <Target className="w-12 h-12 text-purple-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Cybersecurity Topics
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover trends, market intelligence, and benchmarking data across cybersecurity topics. Track vendor landscape and industry evolution.
            </p>
          </div>

          {/* Client-side search and filtering */}
          <CategoriesClient categories={categories} />

          {/* Info Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mt-12">
            <div className="text-center max-w-2xl mx-auto">
              <Target className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Market Intelligence & Benchmarking
              </h3>
              <p className="text-gray-600">
                Each topic includes trend analysis, vendor landscape, curated statistics,
                and industry benchmarks. Make data-driven security decisions with confidence.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show category detail page
  const categoryData = await fetchCategoryData(slugPath)
  const categoryOverride = categoryOverrides.find((c: CategoryOverride) => c.slug === slugPath.join('/'))

  if (!categoryData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Topic Not Found</h1>
            <p className="text-gray-600 mb-4">The requested topic could not be found.</p>
            <Link href="/categories" className="text-purple-600 hover:text-purple-700">
              ← Back to Topics
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cyberstats.io'
  const pageUrl = `${baseUrl}/categories/${slugPath.join('/')}`
  const pageDescription = categoryOverride?.customDescription ||
    (categoryData.parent
      ? `Cybersecurity statistics about ${categoryData.name.toLowerCase()} in ${categoryData.parent.name}`
      : `Cybersecurity statistics about ${categoryData.name.toLowerCase()}`)

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
  const breadcrumbItems = [
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
    }
  ]

  if (categoryData.parent) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: categoryData.parent.name,
      item: `${baseUrl}${categoryData.parent.fullPath}`
    })
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 4,
      name: categoryData.name,
      item: pageUrl
    })
  } else {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: categoryData.name,
      item: pageUrl
    })
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems
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
            {categoryData.parent && (
              <>
                <span>›</span>
                <Link href={categoryData.parent.fullPath} className="hover:text-purple-600">
                  {categoryData.parent.name}
                </Link>
              </>
            )}
            <span>›</span>
            <span className="text-gray-900">{categoryData.name}</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="inline-block p-3 bg-purple-100 rounded-2xl mb-4">
              {categoryData.isParent ? (
                <Layers className="w-12 h-12 text-purple-600" />
              ) : (
                <Target className="w-12 h-12 text-purple-600" />
              )}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {categoryData.name}
            </h1>
            <p className="text-xl text-gray-600">
              {categoryOverride?.customDescription || pageDescription}
            </p>
          </div>

          {/* Subcategories (if parent category) */}
          {categoryData.subcategories && categoryData.subcategories.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-purple-600" />
                Explore Subcategories
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryData.subcategories.map((subcat) => (
                  <Link
                    key={subcat.slug}
                    href={subcat.fullPath}
                    className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                  >
                    <span className="text-sm font-medium text-gray-900 group-hover:text-purple-700">
                      {subcat.name}
                    </span>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                      {subcat.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

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
                      href={category.fullPath}
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
