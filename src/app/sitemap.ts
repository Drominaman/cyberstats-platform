import { MetadataRoute } from 'next'

// Revalidate sitemap every hour
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
    // Fetch all stats
    const response = await fetch(
      `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?key=${apiKey}&format=json&limit=5000&days=365`
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

    // Generate sitemap entries for all stats
    const statEntries: MetadataRoute.Sitemap = data.items.map((stat: any) => ({
      url: `${baseUrl}/stats/${createSlug(stat.title)}`,
      lastModified: new Date(stat.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7
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
        changeFrequency: 'weekly' as const,
        priority: 0.9
      },
      {
        url: `${baseUrl}/vendors`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8
      },
      {
        url: `${baseUrl}/newsletter`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7
      }
    ]

    // Combine all entries
    return [...staticPages, ...statEntries]
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
