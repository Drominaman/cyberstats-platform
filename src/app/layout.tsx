import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientProviders from '@/components/ClientProviders'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cyberstats.io'),
  title: {
    default: 'Cyberstats - Cybersecurity Market Intelligence & Statistics',
    template: '%s | Cyberstats'
  },
  description: 'Discover 8,000+ cybersecurity statistics, market trends, and vendor intelligence. Track ransomware, data breaches, zero trust, and more with real-time insights.',
  keywords: ['cybersecurity statistics', 'security market intelligence', 'ransomware data', 'data breach statistics', 'cyber threat trends', 'vendor analysis'],
  authors: [{ name: 'Cyberstats' }],
  creator: 'Cyberstats',
  publisher: 'Cyberstats',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Cyberstats - Cybersecurity Market Intelligence',
    description: 'Discover 8,000+ cybersecurity statistics, market trends, and vendor intelligence.',
    siteName: 'Cyberstats',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cyberstats - Cybersecurity Market Intelligence'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cyberstats - Cybersecurity Market Intelligence',
    description: 'Discover 8,000+ cybersecurity statistics, market trends, and vendor intelligence.',
    images: ['/og-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cyberstats.io'

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Cyberstats',
    alternateName: 'Cybersecstatistics',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'The largest directory of curated cybersecurity statistics on the web',
    sameAs: [
      // Add social media profiles here when available
    ]
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Cyberstats',
    url: baseUrl,
    description: 'Discover 8,000+ cybersecurity statistics, market trends, and vendor intelligence',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }

  return (
    <html lang="en">
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-DHC3WDR2CS"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-DHC3WDR2CS');
            `,
          }}
        />
        <meta name="google-site-verification" content="j0RHgKmaaZIEI5a_GIRQuieEM0QgFqBwaHawtTuYrac" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
        <ClientProviders />
        <Analytics />
      </body>
    </html>
  )
}
