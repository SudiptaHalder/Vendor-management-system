'use client'

import { useState, useEffect } from 'react'
import VendorLayout from '@/components/vendor/VendorLayout'
import { CheckCircle, XCircle, Clock, DollarSign, Bell } from 'lucide-react'
import Link from 'next/link'

interface Notification {
  id: string
  type: 'approved' | 'rejected' | 'paid' | 'pending'
  title: string
  message: string
  invoiceId?: string
  invoiceNumber?: string
  read: boolean
  createdAt: string
}

export default function VendorNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      // Mock data
      setNotifications([
        {
          id: '1',
          type: 'approved',
          title: 'Invoice Approved',
          message: 'Your invoice INV-2024-002 has been approved',
          invoiceId: '2',
          invoiceNumber: 'INV-2024-002',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '2',
          type: 'paid',
          title: 'Payment Received',
          message: 'Payment of $2,500 has been received for invoice INV-2024-001',
          invoiceId: '1',
          invoiceNumber: 'INV-2024-001',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          type: 'rejected',
          title: 'Invoice Rejected',
          message: 'Your invoice INV-2024-005 was rejected: Missing itemized breakdown',
          invoiceId: '5',
          invoiceNumber: 'INV-2024-005',
          read: false,
          createdAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: '4',
          type: 'pending',
          title: 'New Invoice Submitted',
          message: 'Your invoice INV-2024-006 is pending review',
          invoiceId: '6',
          invoiceNumber: 'INV-2024-006',
          read: true,
          createdAt: new Date(Date.now() - 259200000).toISOString()
        }
      ])
    } catch (err) {
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'approved':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-500" />
      case 'paid':
        return <DollarSign className="w-6 h-6 text-blue-500" />
      default:
        return <Clock className="w-6 h-6 text-yellow-500" />
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </VendorLayout>
    )
  }

  return (
    <VendorLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Stay updated on your invoice status</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{notifications.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Unread</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{unreadCount}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Read</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{notifications.length - unreadCount}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 transition ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {notification.title}
                        </h4>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-gray-400">
                        {getTimeAgo(notification.createdAt)}
                      </span>
                      {notification.invoiceId && (
                        <Link
                          href={`/vendor/invoices?id=${notification.invoiceId}`}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View Invoice →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </VendorLayout>
  )
}
