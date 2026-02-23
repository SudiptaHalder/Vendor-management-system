// apps/web/app/(marketing)/layout.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const navLinks = [
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/demo', label: 'Demo' },
    { href: '/about', label: 'About' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-white font-bold text-xl md:text-2xl">VF</span>
              </div>
              <span className="text-xl md:text-2xl font-bold text-gray-900">
                Vendor<span className="text-blue-600">Flow</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                    pathname === link.href ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      pathname === link.href
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-gray-200">
                  <Link
                    href="/login"
                    className="block w-full px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="block w-full px-4 py-2 mt-2 text-center text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800"
                  >
                    Start Free Trial
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      <main className="pt-16 md:pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">VF</span>
                </div>
                <span className="text-2xl font-bold text-white">VendorFlow</span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed">
                The complete vendor management platform for modern businesses. Streamline operations, reduce costs, and make better decisions.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-400 hover:text-white transition text-sm">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white transition text-sm">Pricing</Link></li>
                <li><Link href="/demo" className="text-gray-400 hover:text-white transition text-sm">Request Demo</Link></li>
                <li><Link href="/integrations" className="text-gray-400 hover:text-white transition text-sm">Integrations</Link></li>
                <li><Link href="/changelog" className="text-gray-400 hover:text-white transition text-sm">Changelog</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition text-sm">About Us</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-white transition text-sm">Careers</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white transition text-sm">Blog</Link></li>
                <li><Link href="/press" className="text-gray-400 hover:text-white transition text-sm">Press</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition text-sm">Contact</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-gray-400 hover:text-white transition text-sm">Help Center</Link></li>
                <li><Link href="/status" className="text-gray-400 hover:text-white transition text-sm">System Status</Link></li>
                <li><Link href="/security" className="text-gray-400 hover:text-white transition text-sm">Security</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition text-sm">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition text-sm">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} VendorFlow. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition">Terms</Link>
              <Link href="/cookies" className="hover:text-white transition">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}