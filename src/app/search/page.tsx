import SearchClient from './SearchClient'

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic'

export default function SearchPage() {
  return <SearchClient />
}
