import { MetadataRoute } from 'next'

// Dynamic rendering - sitemap generates on-demand to prevent build timeouts
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Cache for 1 hour

// Helper to create URL-safe slug from title
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cyberstats.io'
  const apiKey = process.env.NEXT_PUBLIC_API_KEY

  // If no API key, return just static pages
  if (!apiKey) {
    console.warn('No API key available for sitemap generation')
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0
      }
    ]
  }

  try {
    // Fetch all stats for complete sitemap (dynamic rendering prevents build timeouts)
    const response = await fetch(
      `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&limit=10000`,
      { next: { revalidate: 3600 } } // Cache for 1 hour (sitemap is accessed frequently by bots)
    )

    if (!response.ok) {
      console.error('API request failed:', response.status, response.statusText)
      throw new Error(`API returned ${response.status}`)
    }

    const data = await response.json()

    // Check for API errors (rate limits, etc.)
    if (!data || !data.items || !Array.isArray(data.items)) {
      console.error('Invalid API response for sitemap:', data)
      throw new Error('Failed to fetch stats for sitemap')
    }

    // Generate sitemap entries for ALL stats (Google supports up to 50,000 URLs per sitemap)
    // Sort by date to prioritize recent content
    const allStats = data.items
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const statEntries: MetadataRoute.Sitemap = allStats.map((stat: any) => ({
      url: `${baseUrl}/stats/${createSlug(stat.title)}`,
      lastModified: new Date(stat.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6
    }))

    // Extract unique vendors
    const vendorsMap = new Map<string, Date>()
    data.items.forEach((item: any) => {
      if (item.publisher) {
        const slug = item.publisher.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        const existingDate = vendorsMap.get(slug)
        const itemDate = new Date(item.created_at)
        if (!existingDate || itemDate > existingDate) {
          vendorsMap.set(slug, itemDate)
        }
      }
    })

    const vendorEntries: MetadataRoute.Sitemap = Array.from(vendorsMap.entries()).map(([slug, date]) => ({
      url: `${baseUrl}/vendors/${slug}`,
      lastModified: date,
      changeFrequency: 'daily' as const,
      priority: 0.9
    }))

    // Extract unique categories
    const categoriesMap = new Map<string, Date>()
    data.items.forEach((item: any) => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag: string) => {
          const slug = tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          const existingDate = categoriesMap.get(slug)
          const itemDate = new Date(item.created_at)
          if (!existingDate || itemDate > existingDate) {
            categoriesMap.set(slug, itemDate)
          }
        })
      }
    })

    const categoryEntries: MetadataRoute.Sitemap = Array.from(categoriesMap.entries()).map(([slug, date]) => ({
      url: `${baseUrl}/categories/${slug}`,
      lastModified: date,
      changeFrequency: 'daily' as const,
      priority: 0.9
    }))

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0
      },
      {
        url: `${baseUrl}/categories`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.95
      },
      {
        url: `${baseUrl}/vendors`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.95
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.85
      },
      {
        url: `${baseUrl}/newsletter`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6
      },
      {
        url: `${baseUrl}/privacy`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5
      },
      {
        url: `${baseUrl}/terms`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5
      }
    ]

    // Combine all entries
    return [...staticPages, ...vendorEntries, ...categoryEntries, ...statEntries]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return just static pages if stats fetch fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0
      }
    ]
  }
}
