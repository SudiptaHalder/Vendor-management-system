'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Search,
  Bell,
  Settings,
  User,
  ChevronDown,
  Menu,
  Calendar,
  LogOut,
  HelpCircle,
  Moon,
  Sun,
  Users,
  Package,
  Building2,
  DollarSign,
  X
} from 'lucide-react'
import { getCurrentUser, clearAuth } from '@/lib/dev-auth'
import NotificationBell from '@/components/NotificationBell' 
interface NavbarProps {
  onMenuClick: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const profileRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Get user data with safe fallback
  const currentUser = getCurrentUser()
  const user = {
    name: currentUser?.name || 'John Doe',
    email: currentUser?.email || 'john@construction.com',
    initials: currentUser?.name 
      ? currentUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
      : 'JD',
    role: currentUser?.role || 'Administrator'
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    // Mock search results - replace with actual API call
    const mockResults = [
      { type: 'vendor', name: 'ABC Supplies', url: '/vendors/1', icon: Users },
      { type: 'project', name: 'Office Renovation', url: '/projects/1', icon: Building2 },
      { type: 'invoice', name: 'INV-2024-0012', url: '/invoices/1', icon: DollarSign },
      { type: 'purchase order', name: 'PO-2024-0056', url: '/procurement/purchase-orders/1', icon: Package },
    ].filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.type.toLowerCase().includes(query.toLowerCase())
    )

    setSearchResults(mockResults)
    setShowSearchResults(true)
  }

  const handleLogout = () => {
    clearAuth()
    router.push('/')
  }

const handleNavigation = (path: string) => {
  setIsProfileOpen(false)
  router.push(path)
}

  const quickFilters = [
    { name: 'Vendors', icon: Users, href: '/vendors', color: 'blue' },
    { name: 'Projects', icon: Building2, href: '/projects', color: 'green' },
    { name: 'Invoices', icon: DollarSign, href: '/invoices', color: 'purple' },
    { name: 'Purchase Orders', icon: Package, href: '/procurement/purchase-orders', color: 'orange' },
  ]

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 h-16" />
    )
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 h-16">
      <div className="h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Left side - Menu button and Search */}
          <div className="flex items-center flex-1 min-w-0">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 mr-2 flex-shrink-0"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>

            {/* Search bar - Hidden on mobile */}
            <div className="hidden md:block flex-1 max-w-2xl" ref={searchRef}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search vendors, projects, invoices..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                
                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                    {searchResults.map((result, index) => {
                      const Icon = result.icon
                      return (
                        <Link
                          key={index}
                          href={result.url}
                          className="flex items-center px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                          onClick={() => setShowSearchResults(false)}
                        >
                          <div className="p-2 bg-gray-100 rounded-lg mr-3">
                            <Icon size={16} className="text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{result.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{result.type}</p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile search button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 ml-auto"
            >
              <Search size={20} />
            </button>
          </div>

          {/* Quick filters - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-2 mx-4">
            {quickFilters.map((filter) => {
              const Icon = filter.icon
              return (
                <Link
                  key={filter.name}
                  href={filter.href}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center space-x-1 ${
                    pathname.startsWith(filter.href)
                      ? `bg-${filter.color}-100 text-${filter.color}-700`
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  <span>{filter.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Dark mode toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-gray-500 rounded-lg hover:bg-gray-100"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <NotificationBell />

            {/* User menu */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100"
                aria-label="User menu"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {user.initials}
                </div>
                <div className="hidden md:block text-left min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[120px]">
                    {user.role}
                  </p>
                </div>
                <ChevronDown size={16} className="text-gray-500 hidden md:block flex-shrink-0" />
              </button>

              {/* Profile dropdown - ALL LINKS NOW WORKING */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {user.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    {/* Profile Link */}
                    <button
                      onClick={() => handleNavigation('/profile')}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                      <User size={16} className="flex-shrink-0" />
                      <span className="truncate">Your Profile</span>
                    </button>

                    {/* Settings Link */}
                    <button
                      onClick={() => handleNavigation('/settings')}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                      <Settings size={16} className="flex-shrink-0" />
                      <span className="truncate">Settings</span>
                    </button>

                    {/* Calendar Link */}
                    <button
  onClick={() => handleNavigation('/calendar')}
  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
>
  <Calendar size={16} className="flex-shrink-0" />
  <span className="truncate">Calendar</span>
</button>

                    {/* Help & Support Link */}
                    <button
                      onClick={() => handleNavigation('/support')}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                      <HelpCircle size={16} className="flex-shrink-0" />
                      <span className="truncate">Help & Support</span>
                    </button>

                    <div className="border-t border-gray-200 my-2"></div>

                    {/* Logout Button */}
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <LogOut size={16} className="flex-shrink-0" />
                      <span className="truncate">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile search panel */}
        {isSearchOpen && (
          <div className="md:hidden absolute left-0 right-0 top-16 bg-white border-b border-gray-200 p-4 z-30">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Mobile search results */}
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => {
                  const Icon = result.icon
                  return (
                    <Link
                      key={index}
                      href={result.url}
                      className="flex items-center p-3 hover:bg-gray-50 rounded-lg"
                      onClick={() => {
                        setShowSearchResults(false)
                        setIsSearchOpen(false)
                      }}
                    >
                      <div className="p-2 bg-gray-100 rounded-lg mr-3">
                        <Icon size={16} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{result.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{result.type}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}