import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { AlertTriangle, ArrowLeft, Search } from 'lucide-react'

export default function StatNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Statistic Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            The statistic you&apos;re looking for doesn&apos;t exist or may have been removed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Stats
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
