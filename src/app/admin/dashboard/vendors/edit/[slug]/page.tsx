'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Copy, Check } from 'lucide-react'
import vendorOverrides from '@/data/vendor-overrides.json'

export default function EditVendorPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Find existing override if it exists
  const existingOverride = vendorOverrides.find((v: any) => v.slug === params.slug)

  // Form state
  const [customDescription, setCustomDescription] = useState(existingOverride?.customDescription || '')
  const [website, setWebsite] = useState(existingOverride?.website || '')
  const [founded, setFounded] = useState(existingOverride?.founded || '')
  const [headquarters, setHeadquarters] = useState(existingOverride?.headquarters || '')

  const [generatedJSON, setGeneratedJSON] = useState('')

  useEffect(() => {
    // Check authentication
    const token = sessionStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
      return
    }
    setAuthenticated(true)
    setLoading(false)
  }, [router])

  function generateJSON() {
    const override = {
      slug: params.slug,
      ...(customDescription && { customDescription }),
      ...(website && { website }),
      ...(founded && { founded }),
      ...(headquarters && { headquarters })
    }

    const json = JSON.stringify(override, null, 2)
    setGeneratedJSON(json)
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(generatedJSON)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Vendor Information</h2>

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
                onClick={generateJSON}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>Generate JSON</span>
              </button>
            </div>
          </div>

          {/* Generated JSON */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Generated JSON</h2>

            {generatedJSON ? (
              <div className="space-y-4">
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-96 overflow-y-auto">
                    {generatedJSON}
                  </pre>
                  <button
                    onClick={copyToClipboard}
                    className="absolute top-2 right-2 px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors flex items-center space-x-1"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-blue-900 mb-2">Next Steps:</h3>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Copy the JSON above</li>
                    <li>Open <code className="bg-blue-100 px-1 py-0.5 rounded">/src/data/vendor-overrides.json</code></li>
                    <li>Find the vendor with slug "{params.slug}" and update it, or add this as a new entry</li>
                    <li>Save the file and redeploy</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Save className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Fill out the form and click "Generate JSON" to see the output</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
