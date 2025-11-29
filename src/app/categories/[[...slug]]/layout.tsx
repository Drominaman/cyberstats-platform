interface CategoryLayoutProps {
  children: React.ReactNode
}

// Metadata is generated in page.tsx - this layout just passes children through
export default function CategoryLayout({ children }: CategoryLayoutProps) {
  return children
}
