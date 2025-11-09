'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CopyStatButtonProps {
  text: string
}

export default function CopyStatButton({ text }: CopyStatButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
        copied
          ? 'bg-green-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      aria-label="Copy statistic to clipboard"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-2" />
          Copy Stat
        </>
      )}
    </button>
  )
}
