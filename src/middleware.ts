import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware to handle category URL redirects
 *
 * Handles two types of redirects:
 * 1. Orphan URLs that don't match any tag → redirect to closest match
 * 2. Old hierarchical URLs → redirect to flat structure (tags are flat, not hierarchical)
 *
 * NOTE: The taxonomy-based redirects were removed because they redirected
 * working synonym URLs (like /categories/mfa) to broken hierarchical URLs
 * (like /categories/identity-access/multi-factor-authentication).
 * Tags in the database are flat (e.g., "MFA", "EDR"), not hierarchical.
 */

// Explicit redirects for orphan URLs that Google may have cached
const REDIRECT_MAP: Record<string, string> = {
  // Orphan URLs → closest matching tag
  'healthcare-cybersecurity': 'healthcare',
  'xdr': 'edr',  // XDR doesn't exist as tag, EDR does

  // Broken hierarchical URLs → working flat URLs
  'vulnerabilities/zero-day-vulnerabilities': 'zero-day',
  'vulnerabilities/patching': 'patching',
  'vulnerabilities/critical-vulnerabilities': 'critical-vulnerabilities',
  'vulnerabilities/vulnerability-management': 'vulnerability-management',
  'vulnerabilities/software-vulnerabilities': 'software-vulnerabilities',
  'vulnerabilities/cve': 'cve',
  'threats/ransomware': 'ransomware',
  'threats/malware': 'malware',
  'threats/phishing': 'phishing',
  'threats/ddos': 'ddos',
  'threats/supply-chain-attacks': 'supply-chain',
  'threats/advanced-persistent-threats': 'apt',
  'data-security/data-breaches': 'data-breaches',
  'data-security/data-loss-prevention': 'dlp',
  'data-security/encryption': 'encryption',
  'data-security/data-privacy': 'privacy',
  'identity-access/authentication': 'authentication',
  'identity-access/multi-factor-authentication': 'mfa',
  'identity-access/identity-management': 'identity-management',
  'identity-access/access-control': 'access-control',
  'identity-access/password-security': 'password-security',
  'cloud-security/cloud-vulnerabilities': 'cloud',
  'cloud-security/cloud-breaches': 'cloud',
  'cloud-security/cloud-compliance': 'compliance',
  'network-security/firewalls': 'firewall',
  'network-security/network-monitoring': 'network-security',
  'network-security/vpn': 'vpn',
  'endpoint-security/endpoint-detection-and-response': 'edr',
  'endpoint-security/antivirus': 'antivirus',
  'endpoint-security/mobile-security': 'mobile-security',
  'compliance-governance/gdpr': 'gdpr',
  'compliance-governance/soc-2': 'soc',
  'compliance-governance/iso-27001': 'compliance',
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Match category URLs: /categories/{slug} or /categories/{parent}/{child}
  const categoryMatch = path.match(/^\/categories\/(.+)$/)

  if (categoryMatch) {
    const slugPath = categoryMatch[1]

    // Check if this path needs a redirect
    const redirectTo = REDIRECT_MAP[slugPath]
    if (redirectTo) {
      const redirectUrl = new URL(`/categories/${redirectTo}`, request.url)
      console.log(`[Middleware] 301 redirect: ${path} → ${redirectUrl.pathname}`)
      return NextResponse.redirect(redirectUrl, { status: 301 })
    }
  }

  // No redirect needed - continue to page
  return NextResponse.next()
}

// Configure which routes this middleware should run on
export const config = {
  matcher: '/categories/:slug*',
}
