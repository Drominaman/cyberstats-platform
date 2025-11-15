import { MetadataRoute } from 'next'

// ISR: Sitemap cached for 1 hour after generation
export const revalidate = 3600

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
    // Fetch all stats to extract vendors and categories (fast now with indexes!)
    const response = await fetch(
      `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&limit=10000`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )
    const data = await response.json()

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

    // If no data, return static pages only
    if (!data || !data.items || !Array.isArray(data.items)) {
      console.warn('No data from API, returning static pages only')
      return staticPages
    }

    // Extract unique vendors
    const vendorsMap = new Map<string, string>()
    data.items.forEach((item: any) => {
      if (item.publisher) {
        const slug = item.publisher.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        if (slug) {
          vendorsMap.set(slug, item.publisher)
        }
      }
    })

    // Extract unique categories from all tag columns
    const categoriesMap = new Map<string, string>()
    data.items.forEach((item: any) => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag: string) => {
          if (tag) {
            const slug = tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            if (slug) {
              categoriesMap.set(slug, tag)
            }
          }
        })
      }
    })

    // Generate vendor pages
    const vendorPages: MetadataRoute.Sitemap = Array.from(vendorsMap.keys()).map(slug => ({
      url: `${baseUrl}/vendors/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8
    }))

    // Generate category pages
    const categoryPages: MetadataRoute.Sitemap = Array.from(categoriesMap.keys()).map(slug => ({
      url: `${baseUrl}/categories/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8
    }))

    console.log(`Sitemap generated: ${staticPages.length} static, ${vendorPages.length} vendors, ${categoryPages.length} categories`)

    // Combine all pages
    return [...staticPages, ...vendorPages, ...categoryPages]
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
