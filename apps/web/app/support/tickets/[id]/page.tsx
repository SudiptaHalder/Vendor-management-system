'use client'

import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  MessageSquare,
  Paperclip,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Tag,
  Download,
  MoreVertical
} from 'lucide-react'

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [reply, setReply] = useState('')

  // Mock ticket data
  const ticket = {
    id: params.id,
    subject: 'Unable to create new purchase order',
    status: 'open',
    priority: 'high',
    category: 'technical',
    createdAt: '2026-02-13T10:30:00Z',
    updatedAt: '2026-02-13T14:45:00Z',
    description: 'I am trying to create a new purchase order but keep getting an error when adding line items. The error message says "Invalid quantity". I have tried multiple times with different quantities but still get the same error.',
    attachments: [
      { name: 'error-screenshot.png', size: '245 KB' }
    ],
    messages: [
      {
        id: 1,
        from: 'user',
        user: 'John Doe',
        message: 'I am trying to create a new purchase order but keep getting an error when adding line items. The error message says "Invalid quantity". I have tried multiple times with different quantities but still get the same error.',
        timestamp: '2026-02-13T10:30:00Z',
        attachments: ['error-screenshot.png']
      },
      {
        id: 2,
        from: 'support',
        user: 'Sarah (Support)',
        message: 'Hi John, thank you for reaching out. Could you please let me know what quantity values you are trying to enter? Also, could you confirm if you have any special characters or decimal points?',
        timestamp: '2026-02-13T11:15:00Z'
      },
      {
        id: 3,
        from: 'user',
        user: 'John Doe',
        message: 'I am trying to enter 10.5 for quantity. It works for whole numbers like 10, but not for decimals.',
        timestamp: '2026-02-13T11:45:00Z'
      },
      {
        id: 4,
        from: 'support',
        user: 'Sarah (Support)',
        message: 'Thank you for the clarification. I see the issue - some item types don\'t support decimal quantities. If you\'re ordering items that should be whole numbers (like units, pieces), please use integers. For items that can be fractional (like hours, meters), decimals are allowed. I\'ll check why you\'re getting this error for your specific item.',
        timestamp: '2026-02-13T12:30:00Z'
      }
    ]
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      open: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors]}`}>
        {status}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[priority as keyof typeof colors]}`}>
        {priority}
      </span>
    )
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 text-sm text-gray-500 mb-4">
          <Link href="/support" className="hover:text-blue-600">
            Support
          </Link>
          <span>/</span>
          <Link href="/support/tickets" className="hover:text-blue-600">
            Tickets
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Ticket #{ticket.id}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/support/tickets"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
              <div className="flex items-center space-x-3 mt-2">
                {getStatusBadge(ticket.status)}
                {getPriorityBadge(ticket.priority)}
                <span className="text-sm text-gray-500 flex items-center">
                  <Calendar size={14} className="mr-1" />
                  Created {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content - Messages */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Conversation</h2>
            </div>
            <div className="p-6 space-y-6">
              {ticket.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-2xl ${message.from === 'user' ? 'order-1' : 'order-2'}`}>
                    <div className="flex items-start space-x-3">
                      {message.from === 'support' && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-purple-600">S</span>
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {message.user}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div
                          className={`p-4 rounded-lg ${
                            message.from === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                          {message.attachments && (
                            <div className="mt-3 space-y-2">
                              {message.attachments.map((att, idx) => (
                                <div
                                  key={idx}
                                  className={`flex items-center space-x-2 p-2 rounded ${
                                    message.from === 'user'
                                      ? 'bg-blue-700 text-blue-100'
                                      : 'bg-gray-200 text-gray-700'
                                  }`}
                                >
                                  <Paperclip size={14} />
                                  <span className="text-sm">{att}</span>
                                  <Download size={14} className="ml-auto cursor-pointer hover:opacity-75" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {message.from === 'user' && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">J</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Box */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <textarea
                    rows={3}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your reply..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1">
                      <Paperclip size={14} />
                      <span>Attach files</span>
                    </button>
                    <button
                      disabled={!reply.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Send size={16} />
                      <span>Send Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Ticket Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="font-medium text-gray-900">Ticket Details</h3>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500">Category</p>
                <p className="text-sm text-gray-900 capitalize">{ticket.category}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-sm text-gray-900">{new Date(ticket.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Updated</p>
                <p className="text-sm text-gray-900">{new Date(ticket.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="font-medium text-gray-900">Actions</h3>
            </div>
            <div className="p-4 space-y-2">
              <button className="w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 rounded-lg">
                Change Status
              </button>
              <button className="w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 rounded-lg">
                Change Priority
              </button>
              <button className="w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50 rounded-lg">
                Close Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}