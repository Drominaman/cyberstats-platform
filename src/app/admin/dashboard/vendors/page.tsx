'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Building2, Search } from 'lucide-react'
import vendorOverrides from '@/data/vendor-overrides.json'

interface VendorOverride {
  slug: string
  customDescription?: string
  website?: string
  founded?: string
  headquarters?: string
}

export default function ManageVendorsPage() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [vendors, setVendors] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingVendors, setLoadingVendors] = useState(true)

  useEffect(() => {
    // Check authentication
    const token = sessionStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
      return
    }
    setAuthenticated(true)
    setLoading(false)

    // Fetch vendors from API
    async function fetchVendors() {
      try {
        const apiKey = process.env.NEXT_PUBLIC_API_KEY
        const response = await fetch(
          `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&limit=5000&days=365`
        )
        const data = await response.json()

        if (data && data.items) {
          // Extract unique vendors
          const vendorCounts: { [key: string]: number } = {}
          data.items.forEach((item: any) => {
            if (item.publisher) {
              vendorCounts[item.publisher] = (vendorCounts[item.publisher] || 0) + 1
            }
          })

          const vendorList = Object.entries(vendorCounts).map(([name, count]) => ({
            name,
            slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            statsCount: count,
            hasOverride: vendorOverrides.some((v: VendorOverride) => v.slug === name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
          }))

          vendorList.sort((a, b) => a.name.localeCompare(b.name))
          setVendors(vendorList)
        }
      } catch (error) {
        console.error('Failed to fetch vendors:', error)
      } finally {
        setLoadingVendors(false)
      }
    }

    fetchVendors()
  }, [router])

  const filteredVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/admin/dashboard"
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Vendors</h1>
          <p className="text-gray-600">Edit vendor information and add custom descriptions</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:outline-none text-gray-900"
            />
          </div>
        </div>

        {/* Vendors List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loadingVendors ? (
            <div className="p-12 text-center text-gray-600">Loading vendors...</div>
          ) : filteredVendors.length === 0 ? (
            <div className="p-12 text-center text-gray-600">
              No vendors found matching "{searchQuery}"
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredVendors.map((vendor) => (
                <div key={vendor.slug} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Building2 className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-bold text-gray-900">{vendor.name}</h3>
                        {vendor.hasOverride && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                            Customized
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {vendor.statsCount} statistics • Slug: {vendor.slug}
                      </p>
                    </div>
                    <Link
                      href={`/admin/dashboard/vendors/edit/${vendor.slug}`}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Message */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">How to customize vendors</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Click "Edit" on any vendor to add custom information</li>
            <li>• The form will generate JSON that you copy to <code className="bg-blue-100 px-1 py-0.5 rounded">/src/data/vendor-overrides.json</code></li>
            <li>• Custom data will be merged with API data on vendor pages</li>
            <li>• Changes require redeploying the site</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
