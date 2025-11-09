'use client'

import { useEffect, useRef } from 'react'

export default function MinimalGhostEmbed() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load Ghost signup form script
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/ghost/signup-form@~0.3/umd/signup-form.min.js'
    script.setAttribute('data-button-color', '#ffb219')
    script.setAttribute('data-button-text-color', '#000000')
    script.setAttribute('data-site', 'https://www.cybersecstats.com/')
    script.setAttribute('data-locale', 'en')
    script.async = true

    if (containerRef.current) {
      containerRef.current.appendChild(script)
    }

    return () => {
      if (containerRef.current && containerRef.current.contains(script)) {
        containerRef.current.removeChild(script)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: '58px',
        maxWidth: '440px',
        margin: '0 auto',
        width: '100%'
      }}
    />
  )
}
