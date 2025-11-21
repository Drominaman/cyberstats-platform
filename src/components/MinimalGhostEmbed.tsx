'use client'

import { useEffect, useRef, useId } from 'react'

export default function MinimalGhostEmbed() {
  const containerRef = useRef<HTMLDivElement>(null)
  const uniqueId = useId().replace(/:/g, '')

  useEffect(() => {
    if (!containerRef.current) return

    // Check if form already exists in this container
    if (containerRef.current.querySelector('iframe, form')) return

    // Create a wrapper div for the script
    const wrapper = document.createElement('div')
    wrapper.id = `ghost-signup-${uniqueId}`
    containerRef.current.appendChild(wrapper)

    // Create and inject the script inside the wrapper
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/ghost/signup-form@~0.3/umd/signup-form.min.js'
    script.setAttribute('data-button-color', '#ffb219')
    script.setAttribute('data-button-text-color', '#000000')
    script.setAttribute('data-site', 'https://www.cybersecstats.com/')
    script.setAttribute('data-locale', 'en')
    script.async = true

    wrapper.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [uniqueId])

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
