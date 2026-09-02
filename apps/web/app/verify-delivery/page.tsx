'use client'

import { useState, useRef, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { ScanLine, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface DeliveryLineItem {
  poItemNumber: string
  materialCode: string
  quantity: string
  uom: string
}

interface DeliveryData {
  deliveryDocument: string
  supplier: string
  vehicleNo: string | null
  supplierReference: string | null
  deliveryDate: string | null
  poNumber: string | null
  lineItems: DeliveryLineItem[]
}

export default function VerifyDeliveryPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DeliveryData | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/admin-login'
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/vendor/edi/verify/${encodeURIComponent(code.trim())}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || 'No delivery found for this barcode')
      }
    } catch (err) {
      console.error('Error verifying delivery:', err)
      setError('Error connecting to server')
    } finally {
      setLoading(false)
      setCode('')
      inputRef.current?.focus()
    }
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Verify Delivery</h1>
          <p className="text-gray-600 mt-1">Scan the barcode on the vendor's invoice to check it against SAP</p>
        </div>

        <form onSubmit={handleVerify} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Scan or enter delivery document number
          </label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Scan barcode here..."
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-mono"
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Verify'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">A barcode scanner types the value and presses Enter automatically - just scan and it submits.</p>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center">
            <XCircle className="h-8 w-8 text-red-600 mr-3 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800">Not Verified</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-800">Verified - Match Found in SAP</p>
                <p className="text-sm text-green-600">Compare these details against the physical invoice</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="text-gray-500 block">Delivery Document</span>
                <span className="font-mono font-semibold text-gray-900">{result.deliveryDocument}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Supplier (Vendor Code)</span>
                <span className="font-semibold text-gray-900">{result.supplier}</span>
              </div>
              <div>
                <span className="text-gray-500 block">PO Number</span>
                <span className="font-semibold text-gray-900">{result.poNumber || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Vehicle Number</span>
                <span className="font-semibold text-gray-900">{result.vehicleNo || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Vendor's Reference (Invoice No.)</span>
                <span className="font-semibold text-gray-900">{result.supplierReference || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Delivery Date</span>
                <span className="font-semibold text-gray-900">{result.deliveryDate || '-'}</span>
              </div>
            </div>

            <table className="w-full text-sm bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">PO Item</th>
                  <th className="px-3 py-2 text-left">Material</th>
                  <th className="px-3 py-2 text-right">Quantity</th>
                  <th className="px-3 py-2 text-left">UOM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.lineItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2">{item.poItemNumber}</td>
                    <td className="px-3 py-2 font-mono">{item.materialCode}</td>
                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                    <td className="px-3 py-2">{item.uom}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
