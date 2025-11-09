import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import ShareButton from '@/components/ShareButton'
import CopyStatButton from '@/components/CopyStatButton'
import MinimalGhostEmbed from '@/components/MinimalGhostEmbed'
import Footer from '@/components/Footer'
import { Calendar, Building2, Tag, ExternalLink, ArrowLeft } from 'lucide-react'

// ISR Configuration - rebuilds every hour if accessed
export const revalidate = 3600

// Helper to create URL-safe slug from title (first 100 chars)
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

// Pre-build only the top 100 most recent stats at build time
export async function generateStaticParams() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY
    const response = await fetch(
      `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&limit=100`
    )
    const data = await response.json()

    if (!data || !data.items || !Array.isArray(data.items)) {
      console.error('Invalid API response format:', data)
      return []
    }

    return data.items.map((stat: any) => ({
      slug: createSlug(stat.title)
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const stat = await fetchStat(params.slug)

  if (!stat) {
    return {
      title: 'Stat Not Found - Cyberstats Platform'
    }
  }

  const description = stat.title

  return {
    title: `${stat.title.substring(0, 60)} | Cyberstats`,
    description: description.substring(0, 160),
    keywords: stat.tags?.join(', '),
    openGraph: {
      title: stat.title,
      description: description.substring(0, 160),
      type: 'article',
      publishedTime: stat.created_at,
      authors: [stat.publisher],
      tags: stat.tags
    },
    twitter: {
      card: 'summary_large_image',
      title: stat.title,
      description: description.substring(0, 160)
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    }
  }
}

async function fetchStat(slug: string) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY
    const response = await fetch(
      `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&limit=5000&days=365`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )
    const data = await response.json()

    if (!data || !data.items || !Array.isArray(data.items)) {
      console.error('Invalid API response format:', data)
      return null
    }

    // Find the stat by matching slug
    const stat = data.items.find((item: any) => createSlug(item.title) === slug)
    return stat || null
  } catch (error) {
    console.error('Error fetching stat:', error)
    return null
  }
}

async function fetchRelatedStats(publisher: string, tags: string[] = [], currentSlug: string) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY

    // Try to find stats from same publisher first
    const response = await fetch(
      `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&limit=50`,
      { next: { revalidate: 3600 } }
    )
    const data = await response.json()

    if (!data || !data.items) return []

    // Filter by same publisher, exclude current stat
    let related = data.items
      .filter((item: any) =>
        item.publisher === publisher &&
        createSlug(item.title) !== currentSlug
      )
      .slice(0, 3)

    // If we don't have 3, try finding by tags
    if (related.length < 3 && tags.length > 0) {
      const tagMatches = data.items
        .filter((item: any) =>
          createSlug(item.title) !== currentSlug &&
          item.tags?.some((tag: string) => tags.includes(tag))
        )
        .slice(0, 3 - related.length)

      related = [...related, ...tagMatches]
    }

    return related.slice(0, 3)
  } catch (error) {
    console.error('Error fetching related stats:', error)
    return []
  }
}

export default async function StatPage({ params }: { params: { slug: string } }) {
  const stat = await fetchStat(params.slug)

  if (!stat) {
    notFound()
  }

  // Fetch related stats
  const relatedStats = await fetchRelatedStats(stat.publisher, stat.tags, params.slug)

  // Generate JSON-LD structured data for Google rich results
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: stat.title,
    datePublished: stat.created_at,
    author: {
      '@type': 'Organization',
      name: stat.publisher
    },
    publisher: {
      '@type': 'Organization',
      name: 'Cyberstats Platform'
    },
    keywords: stat.tags?.join(', '),
    about: {
      '@type': 'Thing',
      name: 'Cybersecurity Statistics'
    }
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Link */}
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          {/* Main Content */}
          <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-gray-200">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {stat.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-green-500" />
                  <Link
                    href={`/vendors/${stat.publisher.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                    className="hover:text-blue-600"
                  >
                    {stat.publisher}
                  </Link>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {new Date(stat.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              {/* Tags */}
              {stat.tags && stat.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {stat.tags.map((tag: string, i: number) => (
                    <Link
                      key={i}
                      href={`/search?q=${encodeURIComponent(tag)}`}
                      className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Source Link */}
            {stat.link && (
              <div className="p-8 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Source</h2>
                <a
                  href={stat.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Original Report
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
                <p className="text-sm text-gray-500 mt-2">
                  Published on {new Date(stat.published_on).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Share & Copy Section */}
            <div className="p-8 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Share or Copy this stat</h2>
              <div className="flex flex-wrap items-center gap-3">
                <CopyStatButton text={stat.title} />
                <ShareButton title={stat.title} />
              </div>
            </div>
          </article>

          {/* Newsletter Signup */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Want More Statistics Like This?</h3>
            <p className="text-gray-600 text-center mb-6">Get the latest cybersecurity stats delivered to your inbox every week</p>
            <MinimalGhostEmbed />
          </div>

          {/* Related Stats */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Statistics</h2>
            {relatedStats.length > 0 ? (
              <div className="space-y-4">
                {relatedStats.map((relatedStat: any, index: number) => (
                  <Link
                    key={index}
                    href={`/stats/${createSlug(relatedStat.title)}`}
                    className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
                      {relatedStat.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Building2 className="w-4 h-4 mr-1" />
                        {relatedStat.publisher}
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(relatedStat.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {relatedStat.tags && relatedStat.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {relatedStat.tags.slice(0, 3).map((tag: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600">
                  Browse more stats from{' '}
                  <Link
                    href={`/vendors/${stat.publisher.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {stat.publisher}
                  </Link>
                  {stat.tags && stat.tags.length > 0 && (
                    <>
                      {' or explore '}
                      <Link
                        href={`/categories/${stat.tags[0].toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {stat.tags[0]}
                      </Link>
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Final Newsletter CTA */}
          <div className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Stay Ahead of Cyber Threats</h3>
            <p className="text-gray-600 text-center mb-6">Join 1,000+ security professionals getting weekly insights</p>
            <MinimalGhostEmbed />
          </div>
        </div>

        <Footer />
      </div>
    </>
  )
}
