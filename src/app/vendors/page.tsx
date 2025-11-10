import Link from 'next/link'
import { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import VendorsClient from './VendorsClient'
import { Building2 } from 'lucide-react'

// Static generation - pages built once and cached permanently

export const metadata: Metadata = {
  title: 'Cybersecurity Vendors',
  description: 'Track market leaders and emerging vendors in cybersecurity. Explore statistics, reports, and search trends from top security companies.',
  keywords: ['cybersecurity vendors', 'security companies', 'vendor intelligence', 'market leaders', 'security providers'],
  openGraph: {
    title: 'Cybersecurity Vendors | Cyberstats',
    description: 'Track market leaders and emerging vendors in cybersecurity. Explore statistics, reports, and search trends.',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cybersecurity Vendors | Cyberstats',
    description: 'Track market leaders and emerging vendors in cybersecurity.'
  }
}

interface Vendor {
  name: string
  slug: string
  statsCount: number
  recentActivity: string
}

async function fetchVendors(): Promise<Vendor[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY
    const response = await fetch(
      `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&limit=5000&days=365`
    )
    const data = await response.json()

    // Check for API errors (rate limits, etc.)
    if (!data || !data.items || !Array.isArray(data.items)) {
      console.error('Invalid API response:', data)
      return []
    }

    // Count stats by publisher (vendor)
    const vendorCounts: { [key: string]: { count: number; latestDate: string } } = {}

    data.items.forEach((item: any) => {
      if (item.publisher) {
        if (!vendorCounts[item.publisher]) {
          vendorCounts[item.publisher] = { count: 0, latestDate: item.created_at }
        }
        vendorCounts[item.publisher].count++

        // Track most recent activity
        if (new Date(item.created_at) > new Date(vendorCounts[item.publisher].latestDate)) {
          vendorCounts[item.publisher].latestDate = item.created_at
        }
      }
    })

    const vendorList = Object.entries(vendorCounts).map(([name, data]) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      statsCount: data.count,
      recentActivity: new Date(data.latestDate).toLocaleDateString()
    }))

    // Deduplicate by slug (in case multiple publisher names create the same slug)
    const uniqueVendors = new Map<string, any>()
    vendorList.forEach(vendor => {
      const existing = uniqueVendors.get(vendor.slug)
      if (!existing || vendor.statsCount > existing.statsCount) {
        // Keep the vendor with more stats if duplicate slug
        uniqueVendors.set(vendor.slug, vendor)
      }
    })

    return Array.from(uniqueVendors.values())
  } catch (error) {
    console.error('Failed to fetch vendors:', error)
    return []
  }
}

export default async function VendorsPage() {
  const vendors = await fetchVendors()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-green-100 rounded-2xl mb-4">
            <Building2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cybersecurity Vendors
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Track market leaders and emerging vendors in cybersecurity. Explore statistics, reports, and search trends.
          </p>
        </div>

        {/* Client-side search and filtering */}
        <VendorsClient vendors={vendors} />
      </div>
    </div>
  )
}
