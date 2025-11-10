import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search Cybersecurity Statistics',
  description: 'Search 8,000+ curated cybersecurity statistics. Find insights on ransomware, data breaches, zero trust, and more from leading security vendors.',
  keywords: ['cybersecurity search', 'security statistics', 'ransomware data', 'data breach statistics', 'threat intelligence', 'security metrics'],
  alternates: {
    canonical: '/search'
  },
  openGraph: {
    title: 'Search Cybersecurity Statistics | Cyberstats',
    description: 'Search 8,000+ curated cybersecurity statistics and market intelligence.',
    type: 'website',
    images: ['/og-image.png']
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Search Cybersecurity Statistics | Cyberstats',
    description: 'Search 8,000+ curated cybersecurity statistics and market intelligence.',
    images: ['/og-image.png']
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children
}
