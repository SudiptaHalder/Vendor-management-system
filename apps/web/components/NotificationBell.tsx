'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck, Trash2, Loader2 } from 'lucide-react'
import { useNotifications } from '@/app/contexts/NotificationContext'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  
  // Safely try to use notifications
  let notifications = []
  let unreadCount = 0
  let markAsRead = async () => {}
  let markAllAsRead = async () => {}
  let deleteNotification = async () => {}
  let loading = true
  let isInitialized = false

  try {
    const context = useNotifications()
    notifications = context.notifications
    unreadCount = context.unreadCount
    markAsRead = context.markAsRead
    markAllAsRead = context.markAllAsRead
    deleteNotification = context.deleteNotification
    loading = context.loading
    isInitialized = context.isInitialized
  } catch (e) {
    console.log('Notification context not ready in NotificationBell')
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = async (notification: any) => {
    if (notification.status === 'unread') {
      await markAsRead(notification.id)
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
    setIsOpen(false)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'vendor':
        return '🏢'
      case 'invoice':
        return '📄'
      case 'payment':
        return '💰'
      case 'contract':
        return '📝'
      case 'project':
        return '📊'
      case 'approval':
        return '✓'
      default:
        return '🔔'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500'
      case 'medium':
        return 'border-l-4 border-yellow-500'
      default:
        return 'border-l-4 border-blue-500'
    }
  }

  // Don't render anything until mounted on client
  if (!mounted) {
    return (
      <button className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 relative">
        <Bell size={20} />
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
        >
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <CheckCheck size={14} />
                  <span>Mark all as read</span>
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group relative border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    notification.status === 'unread' ? 'bg-blue-50' : ''
                  } ${getPriorityColor(notification.priority)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="p-4 pr-12">
                    <div className="flex items-start space-x-3">
                      <span className="text-lg" role="img" aria-label="notification type">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        {notification.entityType && (
                          <span className="inline-block mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            {notification.entityType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNotification(notification.id)
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="p-3 text-center border-t border-gray-200 bg-gray-50">
            <Link
              href="/notifications"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}