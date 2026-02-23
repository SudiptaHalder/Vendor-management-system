import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, User, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog - VendorFlow',
  description: 'Latest insights, tips, and news from the VendorFlow team.',
}

export default function BlogPage() {
  const posts = [
    {
      slug: 'vendor-management-best-practices',
      title: '10 Vendor Management Best Practices for 2024',
      excerpt: 'Learn the essential strategies to optimize your vendor relationships and improve efficiency.',
      author: 'John Admin',
      date: '2024-03-15',
      readTime: '5 min read',
      image: '/blog/vendor-management.jpg'
    },
    {
      slug: 'procurement-automation-guide',
      title: 'The Complete Guide to Procurement Automation',
      excerpt: 'Discover how automation can streamline your procurement process and save time.',
      author: 'Sarah Johnson',
      date: '2024-03-10',
      readTime: '8 min read',
      image: '/blog/procurement.jpg'
    },
    {
      slug: 'project-management-tips',
      title: '5 Tips for Better Project Management',
      excerpt: 'Simple yet effective tips to keep your projects on track and within budget.',
      author: 'Mike Chen',
      date: '2024-03-05',
      readTime: '4 min read',
      image: '/blog/project-management.jpg'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Blog</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Insights, tips, and news from the VendorFlow team
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition"
            >
              <div className="h-48 bg-gradient-to-br from-blue-600 to-blue-800"></div>
              <div className="p-6">
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <User size={14} className="mr-1" />
                    {post.author}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex items-center text-blue-600 group-hover:text-blue-700">
                  <span className="text-sm font-medium">Read more</span>
                  <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
