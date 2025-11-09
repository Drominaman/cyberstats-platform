import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import MinimalGhostEmbed from '@/components/MinimalGhostEmbed'
import { BookOpen, Calendar, Tag, ArrowLeft } from 'lucide-react'
import blogPosts from '@/data/blog-posts.json'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  author: string
  publishedAt: string
  tags: string[]
  featured?: boolean
}

function findPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}

// Simple markdown renderer for blog content
function MarkdownContent({ content }: { content: string }) {
  const lines = content.split('\n')
  const elements: JSX.Element[] = []
  let currentList: string[] = []
  let key = 0

  const processInlineMarkdown = (text: string) => {
    // Handle **bold** text
    const parts = text.split(/(\*\*.*?\*\*)/)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={key++} className="list-disc pl-6 mb-4 space-y-2">
          {currentList.map((item, i) => (
            <li key={i} className="text-gray-700 leading-relaxed">
              {processInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      )
      currentList = []
    }
  }

  lines.forEach((line) => {
    const trimmedLine = line.trim()

    // Heading
    if (trimmedLine.startsWith('## ')) {
      flushList()
      elements.push(
        <h2 key={key++} className="text-2xl font-bold text-gray-900 mt-8 mb-4">
          {trimmedLine.slice(3)}
        </h2>
      )
    }
    // List item
    else if (trimmedLine.startsWith('- ')) {
      currentList.push(trimmedLine.slice(2))
    }
    // Paragraph
    else if (trimmedLine) {
      flushList()
      elements.push(
        <p key={key++} className="text-gray-700 leading-relaxed mb-4">
          {processInlineMarkdown(trimmedLine)}
        </p>
      )
    }
    // Empty line
    else {
      flushList()
    }
  })

  flushList()

  return <div className="prose prose-lg max-w-none">{elements}</div>
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = findPostBySlug(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found | Cyberstats Blog'
    }
  }

  return {
    title: `${post.title} | Cyberstats Blog`,
    description: post.excerpt
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = findPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back to Blog Link */}
        <Link
          href="/blog"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>

        {/* Article Header */}
        <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {post.featured && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3">
              <span className="text-white text-sm font-semibold">Featured Post</span>
            </div>
          )}

          <div className="p-8 md:p-12">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center text-gray-600">
                <BookOpen className="w-5 h-5 mr-2" />
                <span className="font-medium">{post.author}</span>
              </div>
              <span className="text-gray-400">•</span>
              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-2" />
                <span>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="mt-8">
              <MarkdownContent content={post.content} />
            </div>
          </div>
        </article>

        {/* Newsletter CTA */}
        <div className="mt-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">
            Stay Updated
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Get the latest cybersecurity statistics and insights delivered to your inbox
          </p>
          <div className="max-w-md mx-auto">
            <MinimalGhostEmbed />
          </div>
        </div>

        {/* Related Posts */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">More from the Blog</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogPosts
              .filter((p) => p.slug !== post.slug)
              .slice(0, 2)
              .map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
                >
                  <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {relatedPost.title}
                  </h4>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {relatedPost.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(relatedPost.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
