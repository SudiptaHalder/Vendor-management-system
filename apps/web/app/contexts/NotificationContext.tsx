'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '@/lib/api'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  status: 'unread' | 'read'
  entityType?: string
  entityId?: string
  actionUrl?: string
  priority: string
  createdAt: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  isInitialized: boolean
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  refreshNotifications: () => Promise<void>
}

// Create context with default values to prevent undefined
const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  isInitialized: false,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  refreshNotifications: async () => {}
})

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  const fetchNotifications = async () => {
    try {
      const response = await api.getNotifications({ limit: 20 })
      if (response.success) {
        setNotifications(response.data.notifications)
        setUnreadCount(response.data.unreadCount)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
      setIsInitialized(true)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await api.getUnreadCount()
      if (response.success) {
        setUnreadCount(response.data.count)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const markAsRead = async (id: string) => {
    try {
      const response = await api.markNotificationAsRead(id)
      if (response.success) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === id ? { ...n, status: 'read' } : n
          )
        )
        setUnreadCount(response.data.unreadCount)
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await api.markAllNotificationsAsRead()
      if (response.success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, status: 'read' }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const response = await api.deleteNotification(id)
      if (response.success) {
        setNotifications(prev => prev.filter(n => n.id !== id))
        await fetchUnreadCount()
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const value = {
    notifications,
    unreadCount,
    loading,
    isInitialized,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: fetchNotifications
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}