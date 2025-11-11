'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function HomeClient() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    // Navigate directly to search page with query - runs search immediately
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
      <div className="relative group">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
        <input
          type="text"
          placeholder="Search ransomware, zero trust, breaches, vendors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg text-gray-900 shadow-sm hover:shadow-md transition-all"
        />
        <button
          type="submit"
          className="absolute right-2 top-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  )
}
