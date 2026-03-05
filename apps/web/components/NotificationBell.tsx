'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react'

interface Notification {
  id: number
  type: string
  title: string
  message: string
  read: boolean
  timestamp: string
  invoiceId?: string
  invoiceNumber?: string
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()
    
    // Listen for new notifications
    const handleStorageChange = () => {
      loadNotifications()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const loadNotifications = () => {
    const stored = localStorage.getItem('admin_notifications')
    if (stored) {
      const notifs = JSON.parse(stored)
      setNotifications(notifs)
      setUnreadCount(notifs.filter((n: Notification) => !n.read).length)
    }
  }

  const markAsRead = (id: number) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    )
    setNotifications(updated)
    localStorage.setItem('admin_notifications', JSON.stringify(updated))
    setUnreadCount(updated.filter(n => !n.read).length)
  }

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    setNotifications(updated)
    localStorage.setItem('admin_notifications', JSON.stringify(updated))
    setUnreadCount(0)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_invoice':
        return <DollarSign className="w-4 h-4 text-blue-500" />
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`
    return `${Math.floor(diffMins / 1440)} days ago`
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 relative"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                notifications.slice(0, 5).map((notif) => (
                  <Link
                    key={notif.id}
                    href={`/finance/invoices?id=${notif.invoiceId}`}
                    className={`block p-3 border-b border-gray-100 hover:bg-gray-50 ${
                      !notif.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      markAsRead(notif.id)
                      setShowDropdown(false)
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-1 bg-gray-100 rounded-full">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {getTimeAgo(notif.timestamp)}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>

            {notifications.length > 5 && (
              <div className="p-2 border-t border-gray-200">
                <Link
                  href="/notifications"
                  className="block text-center text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => setShowDropdown(false)}
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
