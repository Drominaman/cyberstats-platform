'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, Search, Filter } from 'lucide-react'

interface Vendor {
  name: string
  slug: string
  statsCount: number
  recentActivity: string
}

interface VendorsClientProps {
  vendors: Vendor[]
}

export default function VendorsClient({ vendors }: VendorsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'stats'>('stats')

  const filteredVendors = vendors
    .filter(vendor =>
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return b.statsCount - a.statsCount
    })

  return (
    <>
      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
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

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'stats')}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none text-gray-900"
            >
              <option value="name">Sort by Name</option>
              <option value="stats">Sort by Activity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vendors Grid */}
      {filteredVendors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <Link
              key={vendor.slug}
              href={`/vendors/${vendor.slug}`}
              className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-green-300 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                {vendor.name}
              </h3>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  <span className="text-xs block">
                    Last updated: {vendor.recentActivity}
                  </span>
                </div>
                <span className="text-green-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                  View →
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No vendors found matching &ldquo;{searchQuery}&rdquo;</p>
        </div>
      )}
    </>
  )
}
