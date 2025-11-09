'use client'

import Link from 'next/link'
import { TrendingUp, Twitter, Linkedin, Mail } from 'lucide-react'
import MinimalGhostEmbed from './MinimalGhostEmbed'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Cyberstats</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Fresh, direct cybersecurity statistics, trends and market data. No fluff.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4">Newsletter</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/newsletter" className="hover:text-white transition-colors">Subscribe</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Past Issues</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Free Dashboard</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Get Pro</Link></li>
            </ul>
          </div>

          {/* Sign Up */}
          <div>
            <h3 className="text-white font-semibold mb-4">Get Started</h3>
            <Link
              href="/newsletter"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors"
            >
              Sign Up Free
            </Link>
            <p className="text-xs text-gray-400 mt-2">Join 1,000+ security professionals</p>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="text-white font-semibold mb-4">Stay Updated</h3>
            <p className="text-sm text-gray-400 mb-4">
              Get weekly cybersecurity insights
            </p>
            <MinimalGhostEmbed />
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="text-gray-400 mb-4 md:mb-0">
              © {currentYear} Cyberstats. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/sitemap.xml" className="text-gray-400 hover:text-white transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
