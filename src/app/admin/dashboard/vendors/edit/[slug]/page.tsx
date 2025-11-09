'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, CheckCircle, Loader } from 'lucide-react'

export default function EditVendorPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [customDescription, setCustomDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [founded, setFounded] = useState('')
  const [headquarters, setHeadquarters] = useState('')

  useEffect(() => {
    // Check authentication
    const token = sessionStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
      return
    }
    setAuthenticated(true)

    // Fetch existing vendor data
    fetchVendorData()
  }, [router, params.slug])

  async function fetchVendorData() {
    try {
      const response = await fetch(`/api/vendors?slug=${params.slug}`)
      const result = await response.json()

      if (result.data) {
        setCustomDescription(result.data.custom_description || '')
        setWebsite(result.data.website || '')
        setFounded(result.data.founded || '')
        setHeadquarters(result.data.headquarters || '')
      }
    } catch (err) {
      console.error('Error fetching vendor data:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)

    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: params.slug,
          customDescription,
          website,
          founded,
          headquarters,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save vendor data')
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Error saving vendor:', err)
      setError(err instanceof Error ? err.message : 'Failed to save vendor data')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 flex items-center space-x-2">
          <Loader className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </div>
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
              href="/admin/dashboard/vendors"
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Vendors</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Vendor</h1>
        <p className="text-gray-600 mb-8">Slug: {params.slug}</p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Vendor Information</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {saved && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Vendor data saved successfully! Changes are live.</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Description
              </label>
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                placeholder="Add a custom description for this vendor..."
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be displayed on the vendor page
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Founded
              </label>
              <input
                type="text"
                value={founded}
                onChange={(e) => setFounded(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                placeholder="2020"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Headquarters
              </label>
              <input
                type="text"
                value={headquarters}
                onChange={(e) => setHeadquarters(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                placeholder="San Francisco, CA"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Changes will be live immediately after saving (may take up to 1 hour due to caching)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
