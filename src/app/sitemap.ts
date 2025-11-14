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
    // TEMPORARILY DISABLED: Database queries timing out due to missing indexes
    // Sitemap will only contain static pages until indexes are added
    // Stats, categories, and vendors pages will still be crawled and indexed via ISR

    console.warn('Sitemap generation skipping dynamic pages due to database performance')

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

    // Return only static pages (dynamic pages discovered via ISR)
    return staticPages
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
