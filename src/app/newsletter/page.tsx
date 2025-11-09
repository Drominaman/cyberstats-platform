'use client'

import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import MinimalGhostEmbed from '@/components/MinimalGhostEmbed'
import { Mail, TrendingUp, Clock, Shield, BarChart3, CheckCircle, Users, Info, BookOpen, XCircle } from 'lucide-react'

export default function NewsletterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-block p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6">
            <Mail className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Get 100 recent cybersecurity statistics in your inbox each month for free
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            A weekly digest of fresh data direct from vendor reports that search engines don't show.
          </p>

          {/* Newsletter Signup */}
          <div className="max-w-xl mx-auto">
            <MinimalGhostEmbed />
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Spot cyber market trends</h3>
                  <p className="text-gray-600 text-sm">
                    Recent data that you won't find on Google.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Direct access</h3>
                  <p className="text-gray-600 text-sm">
                    Get direct access to competitor reports and data.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Save time</h3>
                  <p className="text-gray-600 text-sm">
                    Saves cyber product and marketing teams at least 6 hours of research time each month.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Turn your inbox section */}
        <div className="bg-white rounded-xl p-8 border border-gray-200 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Turn your inbox into a security trend research tool
          </h2>
          <p className="text-lg text-gray-600 text-center mb-8">
            Track live market trends and topics with recent stats in your inbox for when you need them.
          </p>

          <div className="mb-6">
            <MinimalGhostEmbed />
          </div>

          {/* Key Features */}
          <div className="space-y-4 mt-8">
            <div className="flex items-start space-x-3">
              <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-700">
                  <strong>All data is under 12 months old</strong> and directly sourced from reports, blogs, press releases and white papers.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <BookOpen className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-700">
                  <strong>Primary sources only</strong> so you can directly quote stats for reports and presentations or find more data from the same source.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-700">
                  <strong>No broken links</strong> or misquoted &ldquo;SEO&rsquo;d&rdquo; information.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Made for teams */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200 mb-16">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Made for cyber product, marketing and research teams
            </h3>
            <p className="text-gray-600 mb-6">
              Join 1,000+ professionals already subscribed
            </p>
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Ready to Save Hours of Research Time?
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Get 100 recent cybersecurity statistics delivered monthly
          </p>
          <MinimalGhostEmbed />
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How often will I receive emails?</h3>
              <p className="text-gray-600">Weekly. Every Monday you&rsquo;ll get around 25 fresh statistics from the past week.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is it really free?</h3>
              <p className="text-gray-600">Yes! The newsletter is completely free forever. No credit card required.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I unsubscribe anytime?</h3>
              <p className="text-gray-600">Absolutely. Every email includes an unsubscribe link. One click and you&rsquo;re out - no questions asked.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What kind of statistics do you share?</h3>
              <p className="text-gray-600">Fresh data from vendor reports, analyst briefings, and research papers - covering ransomware, data breaches, market trends, threat intelligence, and more. All under 12 months old with primary source links.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
