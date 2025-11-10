import Link from 'next/link'
import { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import CategoriesClient from './CategoriesClient'
import { Target, Shield, Cloud, Network, Lock, Eye, AlertTriangle, Database, Workflow, Globe } from 'lucide-react'

// Static generation - pages built once and cached permanently

export const metadata: Metadata = {
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
    // Fetch stats to extract categories from tags (reduced limit for performance)
    const response = await fetch(
      `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&limit=2000&days=365`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )
    const data = await response.json()

    // Check for API errors (rate limits, etc.)
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
      .filter(([name, count]) => count >= 3) // Only include tags with at least 3 stats
      .sort((a, b) => a[0].localeCompare(b[0])) // Sort alphabetically
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

export default async function CategoriesPage() {
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
