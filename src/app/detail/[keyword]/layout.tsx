import { Metadata } from 'next'

interface DetailLayoutProps {
  children: React.ReactNode
  params: { keyword: string }
}

export async function generateMetadata({ params }: { params: { keyword: string } }): Promise<Metadata> {
  const keyword = decodeURIComponent(params.keyword)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cybersecstatistics.com'

  // Fetch basic data for metadata (lightweight query)
  const apiKey = process.env.NEXT_PUBLIC_API_KEY
  let statsCount = 0
  let topPublishers: string[] = []

  try {
    const response = await fetch(
      `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&q=${encodeURIComponent(keyword)}&format=json&limit=10&count=1`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )

    if (response.ok) {
      const data = await response.json()
      statsCount = data.total_count || data.items?.length || 0

      // Extract top publishers
      if (data.items && data.items.length > 0) {
        const publisherCounts: { [key: string]: number } = {}
        data.items.forEach((item: any) => {
          if (item.publisher) {
            publisherCounts[item.publisher] = (publisherCounts[item.publisher] || 0) + 1
          }
        })
        topPublishers = Object.entries(publisherCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([publisher]) => publisher)
      }
    }
  } catch (error) {
    console.error('Error fetching metadata for detail page:', error)
  }

  const title = `${keyword} Statistics & Trends | Cyberstats`
  const description = statsCount > 0
    ? `Explore ${statsCount} cybersecurity statistics about ${keyword}. Track search trends, reports, and market intelligence from ${topPublishers.slice(0, 2).join(', ')} and more.`
    : `Explore cybersecurity statistics and market intelligence about ${keyword}. Track search trends, reports, and industry insights.`

  return {
    title,
    description: description.substring(0, 160),
    keywords: [keyword, 'cybersecurity statistics', 'security trends', 'market intelligence', ...topPublishers],
    alternates: {
      canonical: `/detail/${encodeURIComponent(keyword)}`
    },
    openGraph: {
      title,
      description: description.substring(0, 160),
      url: `${baseUrl}/detail/${encodeURIComponent(keyword)}`,
      type: 'website',
      siteName: 'Cyberstats',
      images: ['/og-image.png']
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description.substring(0, 160),
      images: ['/og-image.png']
    },
    robots: {
      index: true,
      follow: true
    }
  }
}

export default function DetailLayout({ children }: DetailLayoutProps) {
  return children
}
