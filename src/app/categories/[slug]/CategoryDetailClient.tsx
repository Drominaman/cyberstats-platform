'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, ChevronLeft, ChevronRight } from 'lucide-react'

interface CategoryData {
  name: string
  slug: string
  stats: any[]
  topVendors: { name: string; count: number }[]
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

export default function CategoryDetailClient({ categoryData }: { categoryData: CategoryData }) {
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 20

  const totalPages = Math.ceil(categoryData.stats.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentStats = categoryData.stats.slice(startIndex, endIndex)

  return (
    <div>
      {/* Main Content - Stats List */}
      <div>
        {/* Stats Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, categoryData.stats.length)} of {categoryData.stats.length} results
          </p>
        </div>

        {/* Stats List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="divide-y divide-gray-200">
            {currentStats.map((stat, index) => (
              <Link
                key={index}
                href={`/stats/${createSlug(stat.title)}`}
                className="block px-6 py-4 hover:bg-purple-50 transition-colors group"
              >
                <p className="text-gray-900 mb-2 group-hover:text-purple-600 font-medium">
                  {stat.title}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Building2 className="w-3 h-3 mr-1" />
                    {stat.publisher}
                  </span>
                  <span>•</span>
                  <span>{new Date(stat.created_at).toLocaleDateString()}</span>
                  {stat.tags && stat.tags.length > 1 && (
                    <>
                      <span>•</span>
                      <div className="flex gap-2">
                        {stat.tags.filter((tag: string) => tag !== categoryData.name).slice(0, 2).map((tag: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === page
                          ? 'bg-purple-600 text-white'
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return <span key={page} className="px-2">...</span>
                }
                return null
              })}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
