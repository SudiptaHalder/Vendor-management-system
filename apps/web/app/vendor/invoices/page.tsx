'use client'

import { useState, useEffect } from 'react'
import VendorLayout from '@/components/vendor/VendorLayout'
import Link from 'next/link'
import {
  FileText,
  Download,
  Eye,
  Calendar,
  DollarSign,
  Filter,
  Search,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default function VendorInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    // Mock data - replace with API call
    setInvoices([
      { id: 'INV-001', number: 'INV-2024-001', amount: 2500, status: 'paid', date: '2024-02-15', dueDate: '2024-03-15', poNumber: 'PO-001' },
      { id: 'INV-002', number: 'INV-2024-002', amount: 1800, status: 'pending', date: '2024-03-01', dueDate: '2024-03-31', poNumber: 'PO-002' },
      { id: 'INV-003', number: 'INV-2024-003', amount: 3200, status: 'pending', date: '2024-03-05', dueDate: '2024-04-05', poNumber: 'PO-003' },
      { id: 'INV-004', number: 'INV-2024-004', amount: 1500, status: 'paid', date: '2024-02-28', dueDate: '2024-03-28', poNumber: 'PO-004' },
      { id: 'INV-005', number: 'INV-2024-005', amount: 2800, status: 'paid', date: '2024-02-20', dueDate: '2024-03-20', poNumber: 'PO-005' },
      { id: 'INV-006', number: 'INV-2024-006', amount: 4200, status: 'overdue', date: '2024-01-15', dueDate: '2024-02-15', poNumber: 'PO-006' },
      { id: 'INV-007', number: 'INV-2024-007', amount: 1900, status: 'pending', date: '2024-03-10', dueDate: '2024-04-10', poNumber: 'PO-007' },
    ])
    setLoading(false)
  }, [])

  const filteredInvoices = filter === 'all' 
    ? invoices 
    : invoices.filter(inv => inv.status === filter)

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'paid':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center"><CheckCircle size={12} className="mr-1" /> Paid</span>
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center"><Clock size={12} className="mr-1" /> Pending</span>
      case 'overdue':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center"><XCircle size={12} className="mr-1" /> Overdue</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">{status}</span>
    }
  }

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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">Manage and track all your invoices</p>
        </div>
        <Link
          href="/vendor/invoices/new"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
        >
          <FileText size={16} />
          <span>New Invoice</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                filter === 'all' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center ${
                filter === 'pending' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock size={14} className="mr-1" /> Pending
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center ${
                filter === 'paid' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CheckCircle size={14} className="mr-1" /> Paid
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center ${
                filter === 'overdue' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <XCircle size={14} className="mr-1" /> Overdue
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search invoices..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter size={18} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{invoice.number}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.poNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.dueDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${invoice.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(invoice.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-gray-400 hover:text-gray-600 mr-3">
                    <Eye size={16} />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Download size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </VendorLayout>
  )
}
