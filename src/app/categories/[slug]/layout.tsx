import { Metadata } from 'next'

interface CategoryLayoutProps {
  children: React.ReactNode
  params: { slug: string }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY

    // Fetch all stats to find category
    const response = await fetch(
      `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&limit=5000&days=365`,
      { next: { revalidate: 3600 } }
    )
    const data = await response.json()

    if (!data || !data.items || !Array.isArray(data.items)) {
      return {
        title: 'Topic Not Found'
      }
    }

    // Find category name and stats by matching slug
    let categoryName = ''
    const categoryStats: any[] = []

    data.items.forEach((item: any) => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag: string) => {
          const tagSlug = tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          if (tagSlug === params.slug) {
            categoryName = tag
            categoryStats.push(item)
          }
        })
      }
    })

    if (!categoryName) {
      return {
        title: 'Topic Not Found'
      }
    }

    const statsCount = categoryStats.length

    // Get top vendors
    const vendorCounts: { [key: string]: number } = {}
    categoryStats.forEach((stat) => {
      if (stat.publisher) {
        vendorCounts[stat.publisher] = (vendorCounts[stat.publisher] || 0) + 1
      }
    })

    const topVendors = Object.entries(vendorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name)

    const description = `Explore ${statsCount} statistics and market intelligence about ${categoryName.toLowerCase()}. Track trends from ${topVendors.slice(0, 2).join(', ')} and more leading vendors.`

    return {
      title: `${categoryName} Statistics & Trends`,
      description: description.substring(0, 160),
      keywords: [categoryName, 'cybersecurity statistics', 'market trends', 'security intelligence', ...topVendors],
      alternates: {
        canonical: `/categories/${params.slug}`
      },
      openGraph: {
        title: `${categoryName} | Cyberstats`,
        description: description.substring(0, 160),
        type: 'website',
        images: ['/og-image.png']
      },
      twitter: {
        card: 'summary_large_image',
        title: `${categoryName} | Cyberstats`,
        description: description.substring(0, 160),
        images: ['/og-image.png']
      },
      robots: {
        index: true,
        follow: true
      }
    }
  } catch (error) {
    console.error('Error generating category metadata:', error)
    return {
      title: 'Topic Profile'
    }
  }
}

export default function CategoryLayout({ children }: CategoryLayoutProps) {
  return children
}
