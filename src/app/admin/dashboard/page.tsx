'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Plus, Edit, Trash2, LogOut, Calendar, Tag, Building2, Target } from 'lucide-react'
import blogPosts from '@/data/blog-posts.json'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  author: string
  publishedAt: string
  tags: string[]
  featured?: boolean
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [posts, setPosts] = useState<BlogPost[]>(blogPosts)
  const [loading, setLoading] = useState(true)

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

  function handleLogout() {
    sessionStorage.removeItem('admin_token')
    router.push('/admin')
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
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage blog posts</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                View Site
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Posts</p>
                <p className="text-3xl font-bold text-gray-900">{posts.length}</p>
              </div>
              <BookOpen className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Featured Posts</p>
                <p className="text-3xl font-bold text-gray-900">
                  {posts.filter(p => p.featured).length}
                </p>
              </div>
              <Tag className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                <p className="text-lg font-bold text-gray-900">
                  {posts.length > 0
                    ? new Date(Math.max(...posts.map(p => new Date(p.publishedAt).getTime())))
                        .toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/dashboard/new"
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200 hover:border-blue-400 transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">New Blog Post</h3>
                <p className="text-sm text-gray-600">Create a new blog post</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/dashboard/vendors"
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200 hover:border-green-400 transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-600 rounded-lg group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Manage Vendors</h3>
                <p className="text-sm text-gray-600">Edit vendor pages and information</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/dashboard/categories"
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200 hover:border-purple-400 transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Manage Categories</h3>
                <p className="text-sm text-gray-600">Edit category pages and descriptions</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Blog Posts Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Blog Posts</h2>
        </div>

        {/* Posts List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {posts.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No blog posts yet. Create your first post!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {posts
                .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
                .map((post) => (
                  <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{post.title}</h3>
                          {post.featured && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          <span>•</span>
                          <span>{post.author}</span>
                          {post.tags && post.tags.length > 0 && (
                            <>
                              <span>•</span>
                              <div className="flex gap-1">
                                {post.tags.map((tag, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Link
                          href={`/admin/dashboard/edit/${post.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit post"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${post.title}"?`)) {
                              // In production, this would call an API to delete the post
                              alert('Delete functionality would be implemented here')
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete post"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Info Message */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">How to manage blog posts</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Click "New Post" to create a new blog post</li>
            <li>• The form will generate JSON that you can copy to <code className="bg-blue-100 px-1 py-0.5 rounded">/src/data/blog-posts.json</code></li>
            <li>• Edit existing posts to update their content</li>
            <li>• Changes require updating the JSON file and redeploying</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
