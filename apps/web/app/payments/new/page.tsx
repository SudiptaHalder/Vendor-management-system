'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  CreditCard,
  Save,
  X,
  AlertCircle,
  Receipt,
  Calendar,
  DollarSign,
  Building2,
  Loader2,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

interface Invoice {
  id: string
  invoiceNumber: string
  vendorId: string
  vendor: {
    id: string
    name: string
  }
  total: number
  balance: number
  currency: string
  dueDate: string | null
  status: string
}

export default function NewPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const invoiceId = searchParams.get('invoiceId')
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [loadingInvoices, setLoadingInvoices] = useState(true)

  const [formData, setFormData] = useState({
    invoiceId: invoiceId || '',
    amount: '',
    currency: 'USD',
    method: 'bank_transfer',
    status: 'completed',
    paymentDate: new Date().toISOString().split('T')[0],
    reference: '',
    transactionId: '',
    notes: '',
    bankName: '',
    accountNumber: '',
    checkNumber: '',
    cardLast4: '',
    cardBrand: ''
  })

  useEffect(() => {
    fetchInvoices()
  }, [])

  useEffect(() => {
    if (formData.invoiceId) {
      const invoice = invoices.find(inv => inv.id === formData.invoiceId)
      setSelectedInvoice(invoice || null)
      if (invoice) {
        setFormData(prev => ({
          ...prev,
          currency: invoice.currency,
          amount: invoice.balance.toString()
        }))
      }
    } else {
      setSelectedInvoice(null)
    }
  }, [formData.invoiceId, invoices])

  const fetchInvoices = async () => {
    setLoadingInvoices(true)
    setError('')
    try {
      // Fetch ALL invoices first
      const response = await api.getInvoices()
      console.log('All invoices response:', response)
      
      if (response.success) {
        // Filter invoices that have balance > 0
        // Check both balance field and calculate from total/payments if needed
        const unpaidInvoices = response.data.filter((inv: any) => {
          // If balance is explicitly set and > 0
          if (inv.balance && Number(inv.balance) > 0) {
            return true
          }
          // If balance is not set, calculate from total and payments
          if (!inv.balance && inv.total) {
            const totalPayments = inv.payments?.reduce((sum: number, p: any) => 
              sum + (p.status === 'completed' ? Number(p.amount) : 0), 0) || 0
            const calculatedBalance = Number(inv.total) - totalPayments
            return calculatedBalance > 0
          }
          // Also include pending, sent, partially_paid status invoices
          const unpaidStatuses = ['pending', 'sent', 'partially_paid', 'overdue']
          return unpaidStatuses.includes(inv.status)
        })
        
        console.log('Filtered unpaid invoices:', unpaidInvoices)
        setInvoices(unpaidInvoices)
        
        // If invoiceId is provided in URL, verify it exists in the list
        if (invoiceId) {
          const selectedInv = unpaidInvoices.find((inv: any) => inv.id === invoiceId)
          if (!selectedInv) {
            setError('Selected invoice is not available for payment (already paid or cancelled)')
          }
        }
      } else {
        setError('Failed to load invoices')
      }
    } catch (err) {
      console.error('Error fetching invoices:', err)
      setError('Failed to load invoices')
    } finally {
      setLoadingInvoices(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.invoiceId) {
      setError('Please select an invoice')
      return false
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount')
      return false
    }
    if (selectedInvoice && parseFloat(formData.amount) > Number(selectedInvoice.balance)) {
      setError(`Amount cannot exceed invoice balance of ${selectedInvoice.currency} ${Number(selectedInvoice.balance).toLocaleString()}`)
      return false
    }
    if (!formData.paymentDate) {
      setError('Payment date is required')
      return false
    }
    if (!formData.method) {
      setError('Payment method is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const paymentData = {
        invoiceId: formData.invoiceId,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        method: formData.method,
        status: formData.status,
        paymentDate: formData.paymentDate,
        reference: formData.reference || null,
        transactionId: formData.transactionId || null,
        notes: formData.notes || null,
        bankName: formData.bankName || null,
        accountNumber: formData.accountNumber || null,
        checkNumber: formData.checkNumber || null,
        cardLast4: formData.cardLast4 || null,
        cardBrand: formData.cardBrand || null
      }

      console.log('Submitting payment:', paymentData)
      const response = await api.createPayment(paymentData)
      console.log('Payment response:', response)
      
      if (response.success) {
        setSuccess('Payment recorded successfully!')
        setTimeout(() => {
          router.push(`/payments/${response.data.id}`)
        }, 1500)
      } else {
        setError(response.error || 'Failed to record payment')
      }
    } catch (err: any) {
      console.error('Payment error:', err)
      setError(err.message || 'Failed to record payment')
    } finally {
      setSaving(false)
    }
  }

  const getMethodFields = () => {
    switch (formData.method) {
      case 'check':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check Number
              </label>
              <input
                type="text"
                name="checkNumber"
                value={formData.checkNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Check #"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Bank name"
              />
            </div>
          </div>
        )
      case 'bank_transfer':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction ID
              </label>
              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Transaction ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Bank name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Last 4 digits"
              />
            </div>
          </div>
        )
      case 'credit_card':
      case 'debit_card':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Brand
              </label>
              <select
                name="cardBrand"
                value={formData.cardBrand}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="">Select Card Brand</option>
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="amex">American Express</option>
                <option value="discover">Discover</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last 4 Digits
              </label>
              <input
                type="text"
                name="cardLast4"
                value={formData.cardLast4}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="1234"
                maxLength={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Authorization Code
              </label>
              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Auth code"
              />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  if (loadingInvoices) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 text-sm text-gray-500 mb-4">
          <Link href="/payments" className="hover:text-blue-600">
            Payments
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Record Payment</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/payments"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Record Payment</h1>
              <p className="text-sm text-gray-500 mt-1">Record a payment against an invoice</p>
            </div>
          </div>
          <Link
            href="/payments"
            className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <X size={16} />
            <span>Cancel</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center space-x-2">
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Invoice <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Receipt className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <select
                  name="invoiceId"
                  value={formData.invoiceId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                >
                  <option value="">Select an invoice...</option>
                  {invoices.length === 0 ? (
                    <option value="" disabled>No unpaid invoices available</option>
                  ) : (
                    invoices.map(invoice => (
                      <option key={invoice.id} value={invoice.id}>
                        {invoice.invoiceNumber} - {invoice.vendor?.name || 'Unknown Vendor'} - Balance: {invoice.currency} {Number(invoice.balance || invoice.total).toLocaleString()}
                      </option>
                    ))
                  )}
                </select>
              </div>
              {invoices.length === 0 && (
                <p className="text-sm text-amber-600 mt-2">
                  No unpaid invoices found. Please check if you have invoices with status: pending, sent, partially_paid, or overdue.
                </p>
              )}
            </div>

            {selectedInvoice && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Invoice #</p>
                    <p className="text-sm font-medium text-gray-900">{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Vendor</p>
                    <p className="text-sm font-medium text-gray-900">{selectedInvoice.vendor?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedInvoice.currency} {Number(selectedInvoice.total).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Balance Due</p>
                    <p className="text-sm font-bold text-blue-600">
                      {selectedInvoice.currency} {Number(selectedInvoice.balance || selectedInvoice.total).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
          <div className="space-y-4">
            {/* Amount and Currency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>
            </div>

            {/* Payment Method and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  name="method"
                  value={formData.method}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="online">Online Payment</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            {/* Payment Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference / Check #
                </label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Reference number"
                />
              </div>
            </div>

            {/* Method-specific fields */}
            {getMethodFields()}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                placeholder="Additional payment notes..."
              />
            </div>
          </div>
        </div>

       <div className="flex justify-end space-x-3">
          <Link
            href="/payments"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || !selectedInvoice}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{saving ? 'Recording...' : 'Record Payment'}</span>
          </button>
        </div>
      </form>
    </MainLayout>
  )
}