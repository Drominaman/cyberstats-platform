import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import categoryTaxonomy from '@/data/category-taxonomy.json'

/**
 * Middleware to handle category URL redirects
 *
 * Redirects single-level category URLs to their hierarchical equivalents:
 * - /categories/zero-trust → /categories/access-control/zero-trust
 * - /categories/ztna → /categories/access-control/zero-trust (synonym)
 *
 * This prevents duplicate URLs from being indexed by search engines.
 */
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Match single-level category URLs: /categories/{slug}
  const categoryMatch = path.match(/^\/categories\/([^\/]+)$/)

  if (categoryMatch) {
    const slug = categoryMatch[1]
    const taxonomy = categoryTaxonomy.categories

    // Check if this slug is a subcategory or synonym that should redirect
    for (const parent of taxonomy) {
      for (const subcat of parent.subcategories) {
        // Check if slug matches the subcategory slug or any of its synonyms
        if (subcat.slug === slug || (subcat.synonyms && subcat.synonyms.includes(slug))) {
          // 301 permanent redirect to hierarchical URL
          const redirectUrl = new URL(`/categories/${parent.slug}/${subcat.slug}`, request.url)

          console.log(`[Middleware] 301 redirect: ${path} → ${redirectUrl.pathname}`)

          return NextResponse.redirect(redirectUrl, { status: 301 })
        }
      }
    }
  }

  // No redirect needed - continue to page
  return NextResponse.next()
}

// Configure which routes this middleware should run on
export const config = {
  matcher: '/categories/:slug*',
}
