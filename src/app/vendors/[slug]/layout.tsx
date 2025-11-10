import { Metadata } from 'next'

interface VendorLayoutProps {
  children: React.ReactNode
  params: { slug: string }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY

    // Fetch all stats to find vendor
    const response = await fetch(
      `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&limit=5000&days=365`,
      { next: { revalidate: 3600 } }
    )
    const data = await response.json()

    if (!data || !data.items || !Array.isArray(data.items)) {
      return {
        title: 'Vendor Not Found'
      }
    }

    // Find vendor stats by matching slug
    const vendorStats = data.items.filter((item: any) => {
      if (!item.publisher) return false
      const itemSlug = item.publisher.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      return itemSlug === params.slug
    })

    if (vendorStats.length === 0) {
      return {
        title: 'Vendor Not Found'
      }
    }

    const vendorName = vendorStats[0].publisher
    const statsCount = vendorStats.length

    // Extract categories from tags
    const categories = new Set<string>()
    vendorStats.forEach((stat: any) => {
      if (stat.tags) {
        stat.tags.forEach((tag: string) => categories.add(tag))
      }
    })

    const description = `Explore ${statsCount} statistics, reports, and market intelligence from ${vendorName}. Track trends across ${Array.from(categories).slice(0, 3).join(', ')} and more.`

    return {
      title: `${vendorName} Statistics & Reports`,
      description: description.substring(0, 160),
      keywords: [vendorName, 'cybersecurity vendor', 'security statistics', 'market intelligence', ...Array.from(categories).slice(0, 5)],
      alternates: {
        canonical: `/vendors/${params.slug}`
      },
      openGraph: {
        title: `${vendorName} | Cyberstats`,
        description: description.substring(0, 160),
        type: 'website',
        images: ['/og-image.png']
      },
      twitter: {
        card: 'summary_large_image',
        title: `${vendorName} | Cyberstats`,
        description: description.substring(0, 160),
        images: ['/og-image.png']
      },
      robots: {
        index: true,
        follow: true
      }
    }
  } catch (error) {
    console.error('Error generating vendor metadata:', error)
    return {
      title: 'Vendor Profile'
    }
  }
}

export default function VendorLayout({ children }: VendorLayoutProps) {
  return children
}
