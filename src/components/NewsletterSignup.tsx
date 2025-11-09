'use client'

import { useState } from 'react'
import { Mail, CheckCircle, Loader } from 'lucide-react'

interface NewsletterSignupProps {
  variant?: 'inline' | 'card' | 'banner'
  size?: 'sm' | 'md' | 'lg'
  placeholder?: string
  buttonText?: string
  title?: string
  description?: string
}

export default function NewsletterSignup({
  variant = 'inline',
  size = 'md',
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
  title,
  description
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      setStatus('error')
      setMessage('Please enter a valid email address')
      return
    }

    setStatus('loading')

    try {
      // TODO: Replace with your Ghost newsletter API endpoint
      // For now, we'll just simulate success
      // const response = await fetch('/api/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setStatus('success')
      setMessage('Thanks for subscribing! Check your inbox.')
      setEmail('')
    } catch (error) {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  // Inline variant (for headers, footers)
  if (variant === 'inline') {
    return (
      <div className="w-full max-w-md">
        {status === 'success' ? (
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                disabled={status === 'loading'}
                className="w-full pl-10 pr-24 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="absolute right-1 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
              >
                {status === 'loading' ? <Loader className="w-4 h-4 animate-spin" /> : buttonText}
              </button>
            </div>
            {status === 'error' && (
              <p className="mt-2 text-sm text-red-600">{message}</p>
            )}
          </form>
        )}
      </div>
    )
  }

  // Card variant (for homepage, sidebar)
  if (variant === 'card') {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{title || 'Get Weekly Insights'}</h3>
            <p className="text-sm text-gray-600">{description || 'Cybersecurity stats in your inbox'}</p>
          </div>
        </div>

        {status === 'success' ? (
          <div className="flex items-center space-x-2 text-green-600 bg-white px-4 py-3 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              disabled={status === 'loading'}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center space-x-2"
            >
              {status === 'loading' ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  <span>{buttonText}</span>
                </>
              )}
            </button>
            {status === 'error' && (
              <p className="text-sm text-red-600">{message}</p>
            )}
          </form>
        )}
      </div>
    )
  }

  // Banner variant (for top of pages)
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2">{title || 'Stay Ahead of Cyber Threats'}</h3>
          <p className="text-blue-100">{description || 'Get the latest cybersecurity statistics and trends delivered weekly'}</p>
        </div>

        {status === 'success' ? (
          <div className="flex items-center justify-center space-x-2 bg-white/20 px-4 py-3 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                disabled={status === 'loading'}
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white/50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 font-medium flex items-center space-x-2"
              >
                {status === 'loading' ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <span>{buttonText}</span>
                )}
              </button>
            </div>
            {status === 'error' && (
              <p className="mt-2 text-sm text-red-200">{message}</p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
