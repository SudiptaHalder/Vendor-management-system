
// 'use client'

// import { useState, useEffect } from 'react'
// import Link from 'next/link'
// import { usePathname } from 'next/navigation'
// import { api } from '@/lib/api'
// import {
//   Users,
//   FileText,
//   Receipt,
//   CreditCard,
//   FolderOpen,
//   Calendar,
//   Settings,
//   ChevronDown,
//   ChevronRight,
//   Building2,
//   ClipboardList,
//   BarChart3,
//   MessageSquare,
//   Bell,
//   HelpCircle,
//   LogOut,
//   Menu,
//   X,
//   Home,
//   Package,
//   Truck,
//   FileCheck,
//   DollarSign,
//   Shield,
//   UserCog,
//   FileSignature,
//   Database,
//   Layers,
//   Grid,
//   CheckCircle
// } from 'lucide-react'

// interface SubMenuItem {
//   name: string
//   href: string
//   icon?: any
//   badge?: number
// }

// interface MenuItem {
//   name: string
//   icon: any
//   href?: string
//   submenu?: SubMenuItem[]
//   badge?: number
// }

// export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) {
//   const pathname = usePathname()
//   const [expandedMenus, setExpandedMenus] = useState<string[]>([])
//   const [pendingApprovals, setPendingApprovals] = useState(0)
//   const [activeProjectsCount, setActiveProjectsCount] = useState(0)
//   const [pendingInvoicesCount, setPendingInvoicesCount] = useState(8)

//   // Load expanded menus from localStorage on mount
//   useEffect(() => {
//     const saved = localStorage.getItem('expandedMenus')
//     if (saved) {
//       try {
//         setExpandedMenus(JSON.parse(saved))
//       } catch (e) {
//         // Default to having Vendors and current section expanded
//         const currentSection = getCurrentSectionFromPath(pathname)
//         setExpandedMenus(['Vendors', ...(currentSection ? [currentSection] : [])])
//       }
//     } else {
//       // Default to having Vendors and current section expanded
//       const currentSection = getCurrentSectionFromPath(pathname)
//       setExpandedMenus(['Vendors', ...(currentSection ? [currentSection] : [])])
//     }
//   }, [])

//   // Save expanded menus to localStorage whenever they change
//   useEffect(() => {
//     localStorage.setItem('expandedMenus', JSON.stringify(expandedMenus))
//   }, [expandedMenus])

//   // Auto-expand the section of the current page when navigating
//   useEffect(() => {
//     const currentSection = getCurrentSectionFromPath(pathname)
//     if (currentSection && !expandedMenus.includes(currentSection)) {
//       setExpandedMenus(prev => [...prev, currentSection])
//     }
//   }, [pathname])

//   // Fetch real data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch pending approvals
//         const approvalsResponse = await api.getApprovals()
//         if (approvalsResponse.success) {
//           setPendingApprovals(approvalsResponse.data.length)
//         }

//         // Fetch active projects count
//         // You'll need to implement this API method
//         // const projectsResponse = await api.getProjects({ status: 'active' })
//         // if (projectsResponse.success) {
//         //   setActiveProjectsCount(projectsResponse.data.length)
//         // }

//         // Fetch pending invoices count
//         // const invoicesResponse = await api.getInvoices({ status: 'pending' })
//         // if (invoicesResponse.success) {
//         //   setPendingInvoicesCount(invoicesResponse.data.length)
//         // }
//       } catch (err) {
//         console.error('Error fetching sidebar data:', err)
//       }
//     }
    
//     fetchData()
    
//     // Refresh every 30 seconds
//     const interval = setInterval(fetchData, 30000)
//     return () => clearInterval(interval)
//   }, [])

//   const getCurrentSectionFromPath = (path: string): string | null => {
//     if (path.startsWith('/vendors')) return 'Vendors'
//     if (path.startsWith('/procurement')) return 'Procurement'
//     if (path.startsWith('/projects') || path.startsWith('/work-orders') || path.startsWith('/schedules') || path.startsWith('/resources')) return 'Projects'
//     if (path.startsWith('/invoices') || path.startsWith('/payments') || path.startsWith('/expenses') || path.startsWith('/budget')) return 'Finance'
//     if (path.startsWith('/reports')) return 'Reports'
//     if (path.startsWith('/settings')) return 'Settings'
//     return null
//   }

//   const toggleMenu = (menuName: string) => {
//     setExpandedMenus(prev =>
//       prev.includes(menuName)
//         ? prev.filter(name => name !== menuName)
//         : [...prev, menuName]
//     )
//   }

//   const isActive = (href: string) => {
//     return pathname === href || pathname?.startsWith(href + '/')
//   }
// const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0)

// // Add this effect
// useEffect(() => {
//   const fetchPaymentStats = async () => {
//     try {
//       const response = await api.getPayments({ status: 'pending' })
//       if (response.success) {
//         setPendingPaymentsCount(response.data.length)
//       }
//     } catch (err) {
//       console.error('Error fetching payment stats:', err)
//     }
//   }
  
//   fetchPaymentStats()
// }, [])
//   const menuItems: MenuItem[] = [
//     {
//       name: 'Dashboard',
//       icon: Home,
//       href: '/dashboard'
//     },
//     {
//       name: 'Vendors',
//       icon: Users,
//       submenu: [
//         { name: 'All Vendors', href: '/vendors', icon: Grid },
//         { name: 'Categories', href: '/vendors/categories', icon: Layers },
//         { name: 'Vendor Portal', href: '/vendors/portal', icon: Shield },
//         { name: 'Approvals', href: '/vendors/approvals', icon: CheckCircle, badge: pendingApprovals }
//       ]
//     },
//     {
//       name: 'Procurement',
//       icon: Package,
//       submenu: [
//         { name: 'Purchase Orders', href: '/procurement/purchase-orders', icon: FileText },
//         { name: 'RFQs', href: '/procurement/rfqs', icon: MessageSquare },
//         { name: 'Quotes', href: '/procurement/quotes', icon: FileSignature },
//         { name: 'Contracts', href: '/procurement/contracts', icon: FileCheck },
//         { name: 'Bids', href: '/procurement/bids', icon: ClipboardList }
//       ]
//     },
//     {
//       name: 'Projects',
//       icon: Building2,
//       submenu: [
//         { name: 'Active Projects', href: '/projects/active', icon: ClipboardList, badge: activeProjectsCount },
//         { name: 'All Projects', href: '/projects', icon: Building2 },
//         { name: 'Work Orders', href: '/work-orders', icon: FileText },
//         { name: 'Schedules', href: '/schedules', icon: Calendar },
//         { name: 'Resources', href: '/resources', icon: Database }
//       ]
//     },
//     {
//   name: 'Finance',
//   icon: DollarSign,
//   submenu: [
//     { name: 'Invoices', href: '/invoices', icon: Receipt },
//     { name: 'Payments', href: '/payments', icon: CreditCard, badge: pendingPaymentsCount },
//     { name: 'Expenses', href: '/expenses', icon: FileText },
//     { name: 'Budget', href: '/budget', icon: BarChart3 }
//   ]
// },
//     {
//       name: 'Documents',
//       icon: FolderOpen,
//       href: '/documents'
//     },
//     {
//       name: 'Reports',
//       icon: BarChart3,
//       submenu: [
//         { name: 'Vendor Reports', href: '/reports/vendors' },
//         { name: 'Financial Reports', href: '/reports/financial' },
//         { name: 'Project Reports', href: '/reports/projects' },
//         { name: 'Analytics', href: '/reports/analytics' }
//       ]
//     },
//     {
//       name: 'Settings',
//       icon: Settings,
//       submenu: [
//         { name: 'Company Profile', href: '/settings/company' },
//         { name: 'Team Members', href: '/settings/team' },
//         { name: 'Roles & Permissions', href: '/settings/roles' },
//         { name: 'Billing', href: '/settings/billing' },
//         { name: 'Integrations', href: '/settings/integrations' }
//       ]
//     }
//   ]

//   return (
//     <>
//       {/* Mobile overlay */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
//           onClick={() => setIsOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <aside
//         className={`fixed top-0 left-0 z-30 h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
//           isOpen ? 'w-64' : 'w-20'
//         }`}
//       >
//         {/* Logo */}
//         <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
//           <div className="flex items-center space-x-2">
//             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
//               <span className="text-white font-bold text-xl">VF</span>
//             </div>
//             {isOpen && (
//               <span className="text-xl font-bold text-gray-900">
//                 Vendor<span className="text-blue-600">Flow</span>
//               </span>
//             )}
//           </div>
//           <button
//             onClick={() => setIsOpen(!isOpen)}
//             className="p-1 rounded-lg hover:bg-gray-100 lg:block hidden"
//           >
//             {isOpen ? <X size={20} /> : <Menu size={20} />}
//           </button>
//         </div>

//         {/* Company Info - Collapsible */}
//         {isOpen && (
//           <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
//             <div className="flex items-center space-x-3">
//               <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
//                 <Building2 className="w-5 h-5 text-blue-600" />
//               </div>
//               <div className="flex-1">
//                 <p className="text-sm font-medium text-gray-900">ABC Construction</p>
//                 <p className="text-xs text-gray-500">Enterprise Plan</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Navigation */}
//         <nav className="h-[calc(100vh-8rem)] overflow-y-auto px-3 py-4">
//           <div className="space-y-1">
//             {menuItems.map((item) => (
//               <div key={item.name}>
//                 {item.submenu ? (
//                   <div>
//                     <button
//                       onClick={() => toggleMenu(item.name)}
//                       className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
//                         expandedMenus.includes(item.name)
//                           ? 'bg-blue-50 text-blue-600'
//                           : 'text-gray-700 hover:bg-gray-100'
//                       }`}
//                     >
//                       <div className="flex items-center space-x-3">
//                         <item.icon size={20} />
//                         {isOpen && <span>{item.name}</span>}
//                       </div>
//                       {isOpen && (
//                         <div className="flex items-center space-x-2">
//                           {item.badge !== undefined && item.badge > 0 && (
//                             <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
//                               {item.badge}
//                             </span>
//                           )}
//                           {expandedMenus.includes(item.name) ? (
//                             <ChevronDown size={16} />
//                           ) : (
//                             <ChevronRight size={16} />
//                           )}
//                         </div>
//                       )}
//                     </button>
                    
//                     {/* Submenu */}
//                     {isOpen && expandedMenus.includes(item.name) && (
//                       <div className="ml-8 mt-1 space-y-1">
//                         {item.submenu.map((subItem) => (
//                           <Link
//                             key={subItem.href}
//                             href={subItem.href}
//                             className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
//                               isActive(subItem.href)
//                                 ? 'bg-blue-100 text-blue-600'
//                                 : 'text-gray-600 hover:bg-gray-100'
//                             }`}
//                           >
//                             <div className="flex items-center space-x-3">
//                               {subItem.icon && <subItem.icon size={16} />}
//                               <span>{subItem.name}</span>
//                             </div>
//                             {subItem.badge !== undefined && subItem.badge > 0 && (
//                               <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
//                                 {subItem.badge}
//                               </span>
//                             )}
//                           </Link>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 ) : (
//                   <Link
//                     href={item.href!}
//                     className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
//                       isActive(item.href!)
//                         ? 'bg-blue-50 text-blue-600'
//                         : 'text-gray-700 hover:bg-gray-100'
//                     }`}
//                   >
//                     <div className="flex items-center space-x-3">
//                       <item.icon size={20} />
//                       {isOpen && <span>{item.name}</span>}
//                     </div>
//                     {isOpen && item.badge !== undefined && item.badge > 0 && (
//                       <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
//                         {item.badge}
//                       </span>
//                     )}
//                   </Link>
//                 )}
//               </div>
//             ))}
//           </div>
//         </nav>

//         {/* Bottom section */}
//         <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-3">
//           <div className="space-y-1">
//             <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100">
//               <Bell size={20} />
//               {isOpen && <span>Notifications</span>}
//               {isOpen && (
//                 <span className="ml-auto px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
//                   3
//                 </span>
//               )}
//             </button>
//             <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100">
//               <HelpCircle size={20} />
//               {isOpen && <span>Help & Support</span>}
//             </button>
//             <button 
//               onClick={() => {
//                 localStorage.clear()
//                 window.location.href = '/login'
//               }}
//               className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50"
//             >
//               <LogOut size={20} />
//               {isOpen && <span>Logout</span>}
//             </button>
//           </div>
//         </div>
//       </aside>
//     </>
//   )
// }
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { api } from '@/lib/api'
import { useNotifications } from '@/app/contexts/NotificationContext'
import {
  Users,
  FileText,
  Receipt,
  CreditCard,
  FolderOpen,
  Calendar,
  Settings,
  ChevronDown,
  ChevronRight,
  Building2,
  ClipboardList,
  BarChart3,
  MessageSquare,
  Bell,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Home,
  Package,
  Truck,
  FileCheck,
  DollarSign,
  Shield,
  UserCog,
  FileSignature,
  Database,
  Layers,
  Grid,
  CheckCircle,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from 'lucide-react'

interface SubMenuItem {
  name: string
  href: string
  icon?: any
  badge?: number
}

interface MenuItem {
  name: string
  icon: any
  href?: string
  submenu?: SubMenuItem[]
  badge?: number
}

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  const pathname = usePathname()
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const [pendingApprovals, setPendingApprovals] = useState(0)
  const [activeProjectsCount, setActiveProjectsCount] = useState(0)
  const [pendingInvoicesCount, setPendingInvoicesCount] = useState(8)
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  
  // Safely use notifications
  let unreadCount = 0
  try {
    const notifications = useNotifications()
    unreadCount = notifications.unreadCount
  } catch (e) {
    // Context not available yet
  }

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load expanded menus from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('expandedMenus')
    if (saved) {
      try {
        setExpandedMenus(JSON.parse(saved))
      } catch (e) {
        const currentSection = getCurrentSectionFromPath(pathname)
        setExpandedMenus(['Vendors', ...(currentSection ? [currentSection] : [])])
      }
    } else {
      const currentSection = getCurrentSectionFromPath(pathname)
      setExpandedMenus(['Vendors', ...(currentSection ? [currentSection] : [])])
    }
  }, [])

  // Save expanded menus to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('expandedMenus', JSON.stringify(expandedMenus))
    }
  }, [expandedMenus, mounted])

  // Auto-expand current section
  useEffect(() => {
    const currentSection = getCurrentSectionFromPath(pathname)
    if (currentSection && !expandedMenus.includes(currentSection)) {
      setExpandedMenus(prev => [...prev, currentSection])
    }
  }, [pathname])

  // Fetch real data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const approvalsResponse = await api.getApprovals()
        if (approvalsResponse.success) {
          setPendingApprovals(approvalsResponse.data.length)
        }

        const paymentsResponse = await api.getPayments({ status: 'pending' })
        if (paymentsResponse.success) {
          setPendingPaymentsCount(paymentsResponse.data.length)
        }
      } catch (err) {
        console.error('Error fetching sidebar data:', err)
      }
    }
    
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getCurrentSectionFromPath = (path: string): string | null => {
    if (path.startsWith('/vendors')) return 'Vendors'
    if (path.startsWith('/procurement')) return 'Procurement'
    if (path.startsWith('/projects') || path.startsWith('/work-orders') || path.startsWith('/schedules') || path.startsWith('/resources')) return 'Projects'
    if (path.startsWith('/invoices') || path.startsWith('/payments') || path.startsWith('/expenses') || path.startsWith('/budget')) return 'Finance'
    if (path.startsWith('/documents')) return 'Documents'
    if (path.startsWith('/reports')) return 'Reports'
    if (path.startsWith('/settings')) return 'Settings'
    return null
  }

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuName)
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    )
  }

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/')
  }

  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      icon: Home,
      href: '/dashboard'
    },
    {
      name: 'Vendors',
      icon: Users,
      submenu: [
        { name: 'All Vendors', href: '/vendors', icon: Grid },
        { name: 'Categories', href: '/vendors/categories', icon: Layers },
        { name: 'Vendor Portal', href: '/vendors/portal', icon: Shield },
        { name: 'Approvals', href: '/vendors/approvals', icon: CheckCircle, badge: pendingApprovals }
      ]
    },
    {
      name: 'Procurement',
      icon: Package,
      submenu: [
        { name: 'Purchase Orders', href: '/procurement/purchase-orders', icon: FileText },
        { name: 'RFQs', href: '/procurement/rfqs', icon: MessageSquare },
        { name: 'Quotes', href: '/procurement/quotes', icon: FileSignature },
        { name: 'Contracts', href: '/procurement/contracts', icon: FileCheck },
        { name: 'Bids', href: '/procurement/bids', icon: ClipboardList }
      ]
    },
    {
      name: 'Projects',
      icon: Building2,
      submenu: [
        { name: 'Active Projects', href: '/projects/active', icon: ClipboardList, badge: activeProjectsCount },
        { name: 'All Projects', href: '/projects', icon: Building2 },
        { name: 'Work Orders', href: '/work-orders', icon: FileText },
        { name: 'Schedules', href: '/schedules', icon: Calendar },
        { name: 'Resources', href: '/resources', icon: Database }
      ]
    },
    {
      name: 'Finance',
      icon: DollarSign,
      submenu: [
        { name: 'Invoices', href: '/invoices', icon: Receipt },
        { name: 'Payments', href: '/payments', icon: CreditCard, badge: pendingPaymentsCount },
        { name: 'Expenses', href: '/expenses', icon: FileText },
        { name: 'Budget', href: '/budget', icon: BarChart3 }
      ]
    },
    {
      name: 'Documents',
      icon: FolderOpen,
      href: '/documents'
    },
    {
      name: 'Reports',
      icon: BarChart3,
      submenu: [
        { name: 'Vendor Reports', href: '/reports/vendors' },
        { name: 'Financial Reports', href: '/reports/financial' },
        { name: 'Project Reports', href: '/reports/projects' },
        { name: 'Analytics', href: '/reports/analytics' }
      ]
    },
    {
      name: 'Settings',
      icon: Settings,
      submenu: [
        { name: 'Company Profile', href: '/settings/company' },
        { name: 'Team Members', href: '/settings/team' },
        { name: 'Roles & Permissions', href: '/settings/roles' },
        { name: 'Billing', href: '/settings/billing' },
        { name: 'Integrations', href: '/settings/integrations' }
      ]
    }
  ]

  // Don't render until mounted
  if (!mounted) {
    return (
      <aside className={`fixed top-0 left-0 z-30 h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`} />
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
          isOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo and Minimize Button - Fixed at top */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xl">VF</span>
            </div>
            {isOpen && (
              <span className="text-xl font-bold text-gray-900 truncate">
                Vendor<span className="text-blue-600">Flow</span>
              </span>
            )}
          </div>
          
          {/* Minimize/Maximize Button */}
          <button
  onClick={() => setIsOpen(!isOpen)}
  className="p-1.5 rounded-lg hover:bg-gray-100 lg:block hidden flex-shrink-0 text-gray-700 hover:text-gray-900"
  aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
>
  {isOpen ? <ChevronLeft size={18} className="text-gray-700" /> : <ChevronRightIcon size={18} className="text-gray-700" />}
</button>
        </div>

        {/* Company Info - Fixed below logo */}
        {isOpen && (
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">ABC Construction</p>
                <p className="text-xs text-gray-500 truncate">Enterprise Plan</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation - Scrollable area */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.name}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        expandedMenus.includes(item.name)
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <item.icon size={20} className="flex-shrink-0" />
                        {isOpen && <span className="truncate">{item.name}</span>}
                      </div>
                      {isOpen && (
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                              {item.badge}
                            </span>
                          )}
                          {expandedMenus.includes(item.name) ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </div>
                      )}
                    </button>
                    
                    {/* Submenu */}
                    {isOpen && expandedMenus.includes(item.name) && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                              isActive(subItem.href)
                                ? 'bg-blue-100 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              {subItem.icon && <subItem.icon size={16} className="flex-shrink-0" />}
                              <span className="truncate">{subItem.name}</span>
                            </div>
                            {subItem.badge !== undefined && subItem.badge > 0 && (
                              <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full flex-shrink-0">
                                {subItem.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href!}
                    className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href!)
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <item.icon size={20} className="flex-shrink-0" />
                      {isOpen && <span className="truncate">{item.name}</span>}
                    </div>
                    {isOpen && item.badge !== undefined && item.badge > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full flex-shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Bottom section - Fixed at bottom */}
        <div className="border-t border-gray-200 bg-white p-3 flex-shrink-0">
          <div className="space-y-1">
            <Link
              href="/notifications"
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 relative"
            >
              <Bell size={20} className="flex-shrink-0" />
              {isOpen && <span className="truncate">Notifications</span>}
              {unreadCount > 0 && (
                <span className="ml-auto px-2 py-0.5 text-xs bg-red-500 text-white rounded-full flex-shrink-0">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/support"
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <HelpCircle size={20} className="flex-shrink-0" />
              {isOpen && <span className="truncate">Help & Support</span>}
            </Link>
            <button 
              onClick={() => {
                localStorage.clear()
                window.location.href = '/'
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50"
            >
              <LogOut size={20} className="flex-shrink-0" />
              {isOpen && <span className="truncate">Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}