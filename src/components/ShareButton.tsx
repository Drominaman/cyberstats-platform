'use client'

import { Share2 } from 'lucide-react'

interface ShareButtonProps {
  title: string
  url?: string
}

export default function ShareButton({ title, url }: ShareButtonProps) {
  const handleShare = () => {
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

    if (typeof window !== 'undefined') {
      if (navigator.share) {
        navigator.share({
          title: title,
          url: shareUrl
        }).catch((error) => console.log('Error sharing:', error))
      } else {
        navigator.clipboard.writeText(shareUrl)
        alert('Link copied to clipboard!')
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
    >
      <Share2 className="w-4 h-4 mr-2" />
      Share
    </button>
  )
}
