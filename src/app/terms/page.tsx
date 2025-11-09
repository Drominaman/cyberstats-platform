import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { FileText } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <div className="inline-block p-3 bg-purple-100 rounded-2xl mb-4">
            <FileText className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 prose prose-lg max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Cyberstats, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Cyberstats provides curated cybersecurity statistics, market data, and insights through our website and newsletter. We offer both free and premium subscription tiers.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            When you subscribe to our newsletter or create an account, you agree to:
          </p>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of any unauthorized use</li>
            <li>Be responsible for all activity under your account</li>
          </ul>

          <h2>4. Use of Content</h2>
          <p>
            The statistics, data, and content provided by Cyberstats are for informational purposes only. You may:
          </p>
          <ul>
            <li>Use our content for personal or internal business purposes</li>
            <li>Quote statistics with proper attribution to the original source</li>
            <li>Share our newsletter content with proper credit</li>
          </ul>
          <p>You may not:</p>
          <ul>
            <li>Republish our content without permission</li>
            <li>Use automated systems to scrape or download our data</li>
            <li>Remove attribution or source links from our content</li>
            <li>Use our content for commercial purposes without authorization</li>
          </ul>

          <h2>5. Intellectual Property</h2>
          <p>
            All content, design, and functionality of Cyberstats are owned by us or our licensors and are protected by copyright and other intellectual property laws. The compilation and curation of statistics is our original work.
          </p>

          <h2>6. Third-Party Sources</h2>
          <p>
            We provide links to third-party sources for the statistics we share. We are not responsible for the accuracy, availability, or content of these external sources.
          </p>

          <h2>7. Disclaimer of Warranties</h2>
          <p>
            Our services are provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee:
          </p>
          <ul>
            <li>The accuracy or completeness of any statistics</li>
            <li>Uninterrupted or error-free service</li>
            <li>That defects will be corrected</li>
            <li>That our service is free from viruses or harmful components</li>
          </ul>

          <h2>8. Limitation of Liability</h2>
          <p>
            We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.
          </p>

          <h2>9. Newsletter Subscriptions</h2>
          <p>
            By subscribing to our newsletter:
          </p>
          <ul>
            <li>You consent to receive regular emails from us</li>
            <li>You can unsubscribe at any time using the link in our emails</li>
            <li>We will not share your email with third parties for marketing purposes</li>
          </ul>

          <h2>10. Premium Services</h2>
          <p>
            Premium subscription terms include:
          </p>
          <ul>
            <li>Payment is processed securely through our payment provider</li>
            <li>Subscriptions renew automatically unless canceled</li>
            <li>Refunds are handled on a case-by-case basis</li>
          </ul>

          <h2>11. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access to our services at any time for violation of these terms or for any other reason.
          </p>

          <h2>12. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of our services after changes constitutes acceptance of the new terms.
          </p>

          <h2>13. Governing Law</h2>
          <p>
            These terms are governed by the laws of the jurisdiction in which we operate.
          </p>

          <h2>14. Contact Information</h2>
          <p>
            If you have questions about these Terms of Service, please contact us through our website.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
