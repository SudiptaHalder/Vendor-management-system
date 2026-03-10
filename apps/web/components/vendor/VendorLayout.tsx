'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  User,
  Settings,
  LogOut,
  Menu,
  Bell,
  HelpCircle,
  Clock,
  CheckCircle,
  Package,
  FileSignature,
  MessageSquare,
  BarChart3,
  Upload,
  Grid,
  Download,
  Eye,
  Truck,
  ClipboardList
} from 'lucide-react'

interface VendorLayoutProps {
  children: React.ReactNode
}

export default function VendorLayout({ children }: VendorLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [vendor, setVendor] = useState<any>(null)

  useEffect(() => {
    // Get vendor data from localStorage
    const token = localStorage.getItem('vendorToken')
    const vendorStr = localStorage.getItem('vendor')
    
    if (!token || !vendorStr) {
      router.push('/vendor-login')
      return
    }

    try {
      const vendorData = JSON.parse(vendorStr)
      setVendor(vendorData)
    } catch (err) {
      router.push('/vendor-login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('vendorToken')
    localStorage.removeItem('vendor')
    router.push('/vendor-login')
  }

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/vendor/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Purchase Orders',
      icon: ShoppingCart,
      submenu: [
        { name: 'All Orders', href: '/vendor/purchase-orders', icon: Package },
        { name: 'Pending', href: '/vendor/purchase-orders?status=pending', icon: Clock },
        { name: 'Completed', href: '/vendor/purchase-orders?status=completed', icon: CheckCircle },
        { name: 'Track Shipment', href: '/vendor/tracking', icon: Truck }
      ]
    },
    {
      name: 'Quotes & Bids',
      icon: FileSignature,
      submenu: [
        { name: 'My Quotes', href: '/vendor/quotes', icon: FileText },
        { name: 'Open RFQs', href: '/vendor/rfqs', icon: MessageSquare },
        { name: 'Submit Bid', href: '/vendor/bids/new', icon: Upload }
      ]
    },
    {
      name: 'Orders',
      icon: ClipboardList,
      submenu: [
        { name: 'Order History', href: '/vendor/orders', icon: FileText },
        { name: 'Pending Orders', href: '/vendor/orders?status=pending', icon: Clock }
      ]
    },
    {
      name: 'Documents',
      icon: FileText,
      submenu: [
        { name: 'All Documents', href: '/vendor/documents', icon: FileText },
        { name: 'Upload Document', href: '/vendor/documents/upload', icon: Upload },
        { name: 'Templates', href: '/vendor/templates', icon: Grid }
      ]
    },
    {
      name: 'Reports',
      icon: BarChart3,
      submenu: [
        { name: 'Order Reports', href: '/vendor/reports/orders', icon: BarChart3 },
        { name: 'Activity Log', href: '/vendor/activity', icon: Clock }
      ]
    },
    {
      name: 'Profile',
      href: '/vendor/profile',
      icon: User
    },
    {
      name: 'Settings',
      href: '/vendor/settings',
      icon: Settings
    }
  ]

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/')
  }

  const renderIcon = (icon: any, size: number = 20) => {
    const IconComponent = icon
    return <IconComponent size={size} />
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="h-full bg-gradient-to-b from-green-600 to-green-700 text-white flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-green-500">
            <div className="flex items-center space-x-2 overflow-hidden">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold text-xl">VF</span>
              </div>
              {isSidebarOpen && (
                <span className="text-xl font-bold truncate">
                  Vendor<span className="text-green-200">Portal</span>
                </span>
              )}
            </div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-green-500 lg:block hidden"
            >
              <Menu size={18} />
            </button>
          </div>

          {/* Vendor Info */}
          {isSidebarOpen && vendor && (
            <div className="px-4 py-3 bg-green-600">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  {renderIcon(User, 20)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{vendor.name}</p>
                  <p className="text-xs text-green-200 truncate">ID: {vendor.code}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {menuItems.map((item) => (
              <div key={item.name} className="mb-1">
                {item.submenu ? (
                  <div className="mb-2">
                    <div className="px-3 py-2 text-xs font-semibold text-green-200 uppercase tracking-wider">
                      {isSidebarOpen ? item.name : renderIcon(item.icon, 20)}
                    </div>
                    {isSidebarOpen && (
                      <div className="ml-2 space-y-1">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                              isActive(subItem.href)
                                ? 'bg-green-500 text-white'
                                : 'text-green-100 hover:bg-green-500'
                            }`}
                          >
                            {renderIcon(subItem.icon, 16)}
                            <span>{subItem.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-green-500 text-white'
                        : 'text-green-100 hover:bg-green-500'
                    }`}
                  >
                    {renderIcon(item.icon, 20)}
                    {isSidebarOpen && <span>{item.name}</span>}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-green-500 p-3">
            <button
              onClick={() => router.push('/vendor/notifications')}
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-green-100 rounded-lg hover:bg-green-500 mb-1"
            >
              {renderIcon(Bell, 20)}
              {isSidebarOpen && <span>Notifications</span>}
            </button>
            <button
              onClick={() => router.push('/vendor/support')}
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-green-100 rounded-lg hover:bg-green-500 mb-1"
            >
              {renderIcon(HelpCircle, 20)}
              {isSidebarOpen && <span>Help & Support</span>}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-300 rounded-lg hover:bg-green-500"
            >
              {renderIcon(LogOut, 20)}
              {isSidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Header */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="flex-1" />
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{vendor?.name}</p>
                  <p className="text-xs text-gray-500">Vendor</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  {renderIcon(User, 20)}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
