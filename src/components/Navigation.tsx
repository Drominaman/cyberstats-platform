'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Menu, X, Target, Building2, Search, Mail, BookOpen } from 'lucide-react'

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Cyberstats</h1>
              <p className="text-xs text-gray-500">Security Intelligence</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/categories"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Target className="w-4 h-4 text-purple-500" />
              <span>Topics</span>
            </Link>

            <Link
              href="/vendors"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Building2 className="w-4 h-4 text-green-500" />
              <span>Vendors</span>
            </Link>

            <Link
              href="/blog"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
            >
              <BookOpen className="w-4 h-4 text-orange-500" />
              <span>Blog</span>
            </Link>

            <Link
              href="/search"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Search className="w-4 h-4 text-gray-500" />
              <span>Search</span>
            </Link>

            {/* Sign Up CTA */}
            <Link
              href="/newsletter"
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
            >
              <Mail className="w-4 h-4" />
              <span>Get Digest</span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            <Link
              href="/categories"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Target className="w-4 h-4 mr-3 text-purple-500" />
              <span>Topics</span>
            </Link>

            <Link
              href="/vendors"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Building2 className="w-4 h-4 mr-3 text-green-500" />
              <span>Vendors</span>
            </Link>

            <Link
              href="/blog"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <BookOpen className="w-4 h-4 mr-3 text-orange-500" />
              <span>Blog</span>
            </Link>

            <Link
              href="/search"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Search className="w-4 h-4 mr-3 text-gray-500" />
              <span>Search</span>
            </Link>

            {/* Sign Up CTA */}
            <div className="px-4 pt-2">
              <Link
                href="/newsletter"
                className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Mail className="w-4 h-4 mr-2" />
                Get Digest
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
