


// 'use client'

// import { useState, useEffect, useRef } from 'react'
// import VendorLayout from '@/components/vendor/VendorLayout'
// import jsBarcode from 'jsbarcode'
// import jsPDF from 'jspdf'
// import html2canvas from 'html2canvas'
// import {
//   Plus,
//   X,
//   Package,
//   CheckCircle,
//   Printer,
//   Zap,
//   RefreshCw,
//   AlertCircle,
//   XCircle
// } from 'lucide-react'

// interface LineItem {
//   id: string
//   lineNumber: number
//   materialCode: string
//   materialDesc: string
//   uom: string
//   quantity: number
//   unitPrice: number
//   totalAmount: number
// }

// interface PurchaseOrder {
//   id: string
//   poNumber: string
//   poCreateDate: string
//   plantCode: string
//   status: string
//   lineItems: LineItem[]
// }

// interface EDIInvoice {
//   invoiceNo: string
//   invoiceDate: string
//   vehicleNo: string
//   poNumber: string
//   selectedPO: PurchaseOrder | null
//   lineItemsData: {
//     lineItemId: string
//     materialCode: string
//     materialDesc: string
//     uom: string
//     poQty: number
//     unitPrice: number
//     sapTotalPrice: number
//     invoiceQty: number
//     enteredTotalPrice: number
//     isVerified: boolean
//     isValid: boolean
//     errorMessage: string
//   }[]
//   isSubmitted: boolean
//   barcode: string
// }

// const formatCurrency = (value: any): string => {
//   if (value === null || value === undefined || isNaN(value)) return '0.00'
//   return Number(value).toFixed(2)
// }

// const safeNumber = (value: any): number => {
//   if (value === null || value === undefined || isNaN(value)) return 0
//   return Number(value)
// }

// export default function EDIManualPage() {
//   const [showForm, setShowForm] = useState(false)
//   const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const [submitting, setSubmitting] = useState(false)

//   const barcodeRef = useRef<HTMLImageElement | null>(null)
//   const printRef = useRef<HTMLDivElement | null>(null)

//   const [formData, setFormData] = useState<EDIInvoice>({
//     invoiceNo: '',
//     invoiceDate: '',
//     vehicleNo: '',
//     poNumber: '',
//     selectedPO: null,
//     lineItemsData: [],
//     isSubmitted: false,
//     barcode: ''
//   })

//   useEffect(() => {
//     fetchPurchaseOrders()
//   }, [])

//   useEffect(() => {
//     if (formData.isSubmitted && formData.barcode) {
//       setTimeout(() => {
//         try {
//           const offscreen = document.createElement('canvas')
//           jsBarcode(offscreen, formData.barcode, {
//             format: 'CODE128',
//             width: 2.5,
//             height: 60,
//             displayValue: true,
//             lineColor: '#000000',
//             background: '#ffffff'
//           })
//           if (barcodeRef.current) {
//             barcodeRef.current.src = offscreen.toDataURL('image/png')
//           }
//         } catch (error) {
//           console.error('Barcode generation error:', error)
//         }
//       }, 100)
//     }
//   }, [formData.isSubmitted, formData.barcode])

//   const fetchPurchaseOrders = async () => {
//     setLoading(true)
//     setError('')
//     try {
//       const token = localStorage.getItem('vendorToken')
//       if (!token) {
//         setError('Not authenticated')
//         setLoading(false)
//         return
//       }

//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/vendor/sap-purchase-orders`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       })

//       if (response.status === 401) {
//         localStorage.removeItem('vendorToken')
//         localStorage.removeItem('vendor')
//         window.location.href = '/vendor-login'
//         return
//       }

//       const data = await response.json()
      
//       if (data.success) {
//         setPurchaseOrders(data.data || [])
//       } else {
//         setError(data.error || 'Failed to fetch purchase orders')
//       }
//     } catch (error) {
//       console.error('Error fetching POs:', error)
//       setError('Error connecting to server')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handlePONumberChange = (poNumber: string) => {
//     const selectedPO = purchaseOrders.find(po => po.poNumber === poNumber) || null

//     const lineItemsData = selectedPO?.lineItems.map((item) => {
//       const unitPrice = safeNumber(item.unitPrice)
//       const quantity = safeNumber(item.quantity)
//       const sapTotalPrice = unitPrice * quantity
      
//       return {
//         lineItemId: item.id || '',
//         materialCode: item.materialCode || '',
//         materialDesc: item.materialDesc || '',
//         uom: item.uom || '',
//         poQty: quantity,
//         unitPrice: unitPrice,
//         sapTotalPrice: sapTotalPrice,
//         invoiceQty: 0,
//         enteredTotalPrice: 0,
//         isVerified: false,
//         isValid: false,
//         errorMessage: ''
//       }
//     }) || []

//     setFormData({
//       ...formData,
//       poNumber,
//       selectedPO,
//       lineItemsData,
//       invoiceNo: `INV-${Date.now()}`,
//       invoiceDate: new Date().toISOString().split('T')[0],
//       vehicleNo: ''
//     })
//   }

//   const handleInvoiceQtyChange = (index: number, value: number) => {
//     const updatedLineItems = [...formData.lineItemsData]
//     const item = updatedLineItems[index]
//     const maxQty = item.poQty

//     let invoiceQty = value
//     if (invoiceQty > maxQty) {
//       invoiceQty = maxQty
//       alert(`Invoice quantity cannot exceed PO quantity (${maxQty})`)
//     }

//     item.invoiceQty = invoiceQty
//     item.isVerified = false
//     item.isValid = false
//     item.errorMessage = ''

//     setFormData({ ...formData, lineItemsData: updatedLineItems })
//   }

//   const handleEnteredTotalPriceChange = (index: number, value: number) => {
//     const updatedLineItems = [...formData.lineItemsData]
//     updatedLineItems[index].enteredTotalPrice = value
//     updatedLineItems[index].isVerified = false
//     updatedLineItems[index].isValid = false
//     updatedLineItems[index].errorMessage = ''
//     setFormData({ ...formData, lineItemsData: updatedLineItems })
//   }

//   const handleCheckLine = (index: number) => {
//     const updatedLineItems = [...formData.lineItemsData]
//     const item = updatedLineItems[index]

//     if (item.invoiceQty <= 0) {
//       item.errorMessage = 'Invoice quantity must be greater than 0'
//       item.isValid = false
//       item.isVerified = false
//       setFormData({ ...formData, lineItemsData: updatedLineItems })
//       return
//     }

//     if (item.enteredTotalPrice <= 0) {
//       item.errorMessage = 'Total price must be greater than 0'
//       item.isValid = false
//       item.isVerified = false
//       setFormData({ ...formData, lineItemsData: updatedLineItems })
//       return
//     }

//     const expectedTotalPrice = item.unitPrice * item.invoiceQty
//     const tolerance = 0.01
//     const diff = Math.abs(item.enteredTotalPrice - expectedTotalPrice)
//     const isPriceValid = diff <= (expectedTotalPrice * tolerance)

//     if (isPriceValid) {
//       item.isValid = true
//       item.isVerified = true
//       item.errorMessage = ''  // Clear error message on success
//     } else {
//       item.isValid = false
//       item.isVerified = false
//       item.errorMessage = `Expected: ₹${formatCurrency(expectedTotalPrice)}`
//     }

//     setFormData({ ...formData, lineItemsData: updatedLineItems })
//   }

//   const allLinesVerified = () => {
//     if (formData.lineItemsData.length === 0) return false
//     return formData.lineItemsData.every(item => item.isVerified === true && item.isValid === true)
//   }

//   const generateBarcodeNumber = () => {
//     return Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString()
//   }

//   const handleSubmit = async () => {
//     if (!allLinesVerified()) {
//       alert('Please verify all line items before submitting')
//       return
//     }

//     if (!formData.invoiceNo || !formData.invoiceDate || !formData.vehicleNo) {
//       alert('Please fill all invoice details')
//       return
//     }

//     setSubmitting(true)

//     const barcode = generateBarcodeNumber()
//     await new Promise(resolve => setTimeout(resolve, 500))

//     setFormData({
//       ...formData,
//       isSubmitted: true,
//       barcode
//     })

//     setSubmitting(false)
//   }

//   const handlePrint = () => {
//     const printContent = printRef.current
//     if (printContent) {
//       const originalContents = document.body.innerHTML
//       document.body.innerHTML = printContent.innerHTML
//       window.print()
//       document.body.innerHTML = originalContents
//       window.location.reload()
//     }
//   }

//   const resetForm = () => {
//     setShowForm(false)
//     setFormData({
//       invoiceNo: '',
//       invoiceDate: '',
//       vehicleNo: '',
//       poNumber: '',
//       selectedPO: null,
//       lineItemsData: [],
//       isSubmitted: false,
//       barcode: ''
//     })
//   }

//   const isFormValid = () => {
//     return formData.invoiceNo &&
//       formData.invoiceDate &&
//       formData.vehicleNo &&
//       formData.poNumber &&
//       allLinesVerified()
//   }

//   if (loading) {
//     return (
//       <VendorLayout>
//         <div className="flex justify-center py-12">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
//         </div>
//       </VendorLayout>
//     )
//   }

//   return (
//     <VendorLayout>
//       <div className="w-full">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">Manual EDI</h1>
//             <p className="text-gray-600 mt-1">Create and submit manual EDI invoices</p>
//           </div>
//           {!showForm && !formData.isSubmitted && (
//             <button
//               onClick={() => setShowForm(true)}
//               className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 text-sm"
//             >
//               <Plus size={18} />
//               <span>Add Manual EDI</span>
//             </button>
//           )}
//         </div>

//         {error && (
//           <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm">
//             <AlertCircle size={16} className="mr-2" />
//             {error}
//           </div>
//         )}

//         {!loading && purchaseOrders.length === 0 && !showForm && !formData.isSubmitted && !error && (
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
//             <Package size={40} className="mx-auto mb-3 text-gray-400" />
//             <h3 className="text-base font-medium text-gray-900 mb-1">No Purchase Orders Found</h3>
//             <p className="text-sm text-gray-500">You don't have any purchase orders to create EDI for.</p>
//             <button
//               onClick={fetchPurchaseOrders}
//               className="mt-4 px-4 py-2 text-sm text-green-600 border border-green-200 rounded-lg hover:bg-green-50"
//             >
//               <RefreshCw size={14} className="inline mr-1" />
//               Refresh from SAP
//             </button>
//           </div>
//         )}

//         {/* EDI Form */}
//         {showForm && (
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold text-gray-900">Create EDI Invoice</h2>
//               {!formData.isSubmitted && (
//                 <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded-lg">
//                   <X size={20} />
//                 </button>
//               )}
//             </div>

//             {/* Basic Information */}
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1">
//                   Invoice Number <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.invoiceNo}
//                   onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
//                   className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
//                   placeholder="INV-2024-001"
//                   disabled={formData.isSubmitted}
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1">
//                   Invoice Date <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   value={formData.invoiceDate}
//                   onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
//                   className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
//                   disabled={formData.isSubmitted}
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1">
//                   Vehicle Number <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.vehicleNo}
//                   onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
//                   className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
//                   placeholder="MH-12-AB-1234"
//                   disabled={formData.isSubmitted}
//                 />
//               </div>
//             </div>

//             {/* PO Selection */}
//             <div className="mb-4">
//               <label className="block text-xs font-medium text-gray-700 mb-1">
//                 Select PO Number <span className="text-red-500">*</span>
//               </label>
//               <select
//                 value={formData.poNumber}
//                 onChange={(e) => handlePONumberChange(e.target.value)}
//                 className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
//                 disabled={formData.isSubmitted}
//               >
//                 <option value="">-- Select Purchase Order --</option>
//                 {purchaseOrders.map(po => (
//                   <option key={po.id} value={po.poNumber}>
//                     {po.poNumber} - {po.plantCode}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Line Items Table */}
//             {formData.selectedPO && formData.lineItemsData.length > 0 && (
//               <div className="mt-4">
//                 <h3 className="text-sm font-semibold text-gray-900 mb-2">Line Items</h3>
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-xs border border-gray-200 rounded-lg">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-2 py-1.5 text-left">Material</th>
//                         <th className="px-2 py-1.5 text-left">Description</th>
//                         <th className="px-2 py-1.5 text-left w-10">UOM</th>
//                         <th className="px-2 py-1.5 text-right w-14">PO Qty</th>
//                         <th className="px-2 py-1.5 text-right w-16">Unit Price</th>
//                         <th className="px-2 py-1.5 text-right w-20">Invoice Qty</th>
//                         <th className="px-2 py-1.5 text-right w-24">Entered Total</th>
//                         <th className="px-2 py-1.5 text-center w-16">Action</th>
//                         <th className="px-2 py-1.5 text-center w-12">Status</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200">
//                       {formData.lineItemsData.map((item, idx) => {
//                         const isVerified = item.isVerified
//                         const isValid = item.isValid
//                         const hasError = !isValid && !isVerified && item.errorMessage

//                         return (
//                           <tr key={idx} className={isVerified && isValid ? 'bg-green-50' : hasError ? 'bg-red-50' : 'bg-white'}>
//                             <td className="px-2 py-1.5 font-mono">{item.materialCode}</td>
//                             <td className="px-2 py-1.5 truncate max-w-[120px]">{item.materialDesc}</td>
//                             <td className="px-2 py-1.5">{item.uom}</td>
//                             <td className="px-2 py-1.5 text-right font-medium">{item.poQty}</td>
//                             <td className="px-2 py-1.5 text-right">₹{formatCurrency(item.unitPrice)}</td>
//                             <td className="px-2 py-1.5">
//                               <input
//                                 type="number"
//                                 value={item.invoiceQty || ''}
//                                 onChange={(e) => handleInvoiceQtyChange(idx, parseFloat(e.target.value) || 0)}
//                                 className={`w-full px-1 py-0.5 text-right text-xs border rounded bg-white focus:ring-1 focus:ring-green-500 ${hasError ? 'border-red-500' : 'border-gray-300'}`}
//                                 disabled={formData.isSubmitted || isVerified}
//                                 placeholder="Qty"
//                                 step="1"
//                                 min="0"
//                                 max={item.poQty}
//                               />
//                             </td>
//                             <td className="px-2 py-1.5">
//                               <input
//                                 type="number"
//                                 value={item.enteredTotalPrice || ''}
//                                 onChange={(e) => handleEnteredTotalPriceChange(idx, parseFloat(e.target.value) || 0)}
//                                 className={`w-full px-1 py-0.5 text-right text-xs border rounded bg-white focus:ring-1 focus:ring-green-500 ${hasError ? 'border-red-500' : 'border-gray-300'}`}
//                                 disabled={formData.isSubmitted || isVerified}
//                                 placeholder="Total"
//                                 step="0.01"
//                                 min="0"
//                               />
//                               {hasError && (
//                                 <div className="text-red-500 text-[10px] mt-0.5">{item.errorMessage}</div>
//                               )}
//                               {isValid && isVerified && (
//                                 <div className="text-green-600 text-[10px] mt-0.5">✓ Verified (₹{formatCurrency(item.unitPrice * item.invoiceQty)})</div>
//                               )}
//                             </td>
//                             <td className="px-2 py-1.5 text-center">
//                               {!formData.isSubmitted && !isVerified && (
//                                 <button
//                                   onClick={() => handleCheckLine(idx)}
//                                   disabled={!item.invoiceQty || !item.enteredTotalPrice}
//                                   className={`px-2 py-0.5 rounded text-xs ${
//                                     item.invoiceQty && item.enteredTotalPrice
//                                       ? 'bg-blue-600 text-white hover:bg-blue-700'
//                                       : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                                   }`}
//                                 >
//                                   Check
//                                 </button>
//                               )}
//                               {isVerified && isValid && (
//                                 <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-green-800 bg-green-100 rounded-full">
//                                   <CheckCircle size={10} className="mr-0.5" />
//                                   OK
//                                 </span>
//                               )}
//                               {isVerified && !isValid && (
//                                 <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-red-800 bg-red-100 rounded-full">
//                                   <XCircle size={10} className="mr-0.5" />
//                                   Error
//                                 </span>
//                               )}
//                             </td>
//                             <td className="px-2 py-1.5 text-center">
//                               {isVerified && isValid ? (
//                                 <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-green-800 bg-green-100 rounded-full">✓</span>
//                               ) : isVerified && !isValid ? (
//                                 <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-red-800 bg-red-100 rounded-full">✗</span>
//                               ) : (
//                                 <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">Pending</span>
//                               )}
//                             </td>
//                           </tr>
//                         )
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}

//             {/* Submit Button */}
//             {!formData.isSubmitted && (
//               <div className="mt-4 flex justify-end">
//                 <button
//                   onClick={handleSubmit}
//                   disabled={!isFormValid() || submitting}
//                   className={`px-4 py-1.5 rounded-lg flex items-center space-x-2 text-sm ${
//                     isFormValid() && !submitting
//                       ? 'bg-green-600 text-white hover:bg-green-700'
//                       : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                   }`}
//                 >
//                   {submitting ? (
//                     <>
//                       <RefreshCw size={14} className="animate-spin" />
//                       <span>Submitting...</span>
//                     </>
//                   ) : (
//                     <>
//                       <Zap size={14} />
//                       <span>Submit EDI</span>
//                     </>
//                   )}
//                 </button>
//               </div>
//             )}

//             {/* Print Area */}
//             <div ref={printRef}>
//               {/* Submitted Line Items */}
//               {formData.isSubmitted && formData.lineItemsData.length > 0 && (
//                 <div className="mt-6 pt-4 border-t border-gray-200">
//                   <h3 className="text-sm font-semibold text-gray-900 mb-3">Submitted Line Items</h3>
//                   <div className="overflow-x-auto">
//                     <table className="w-full text-xs border border-gray-200 rounded-lg">
//                       <thead className="bg-gray-50">
//                         <tr>
//                           <th className="px-2 py-1.5 text-left">Material Code</th>
//                           <th className="px-2 py-1.5 text-left">Description</th>
//                           <th className="px-2 py-1.5 text-left">UOM</th>
//                           <th className="px-2 py-1.5 text-right">Invoice Qty</th>
//                           <th className="px-2 py-1.5 text-right">Total Price (₹)</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-gray-200">
//                         {formData.lineItemsData.map((item, idx) => (
//                           <tr key={idx}>
//                             <td className="px-2 py-1.5 font-mono">{item.materialCode}</td>
//                             <td className="px-2 py-1.5">{item.materialDesc}</td>
//                             <td className="px-2 py-1.5">{item.uom}</td>
//                             <td className="px-2 py-1.5 text-right">{item.invoiceQty}</td>
//                             <td className="px-2 py-1.5 text-right">₹{formatCurrency(item.enteredTotalPrice)}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                       <tfoot className="bg-gray-50">
//                         <tr>
//                           <td colSpan={4} className="px-2 py-1.5 text-right font-semibold">Total:</td>
//                           <td className="px-2 py-1.5 text-right font-bold text-green-600">
//                             ₹{formData.lineItemsData.reduce((sum, item) => sum + safeNumber(item.enteredTotalPrice), 0).toFixed(2)}
//                           </td>
//                         </tr>
//                       </tfoot>
//                     </table>
//                   </div>
//                 </div>
//               )}

//               {/* Invoice Summary */}
//               {formData.isSubmitted && (
//                 <div className="mt-4 pt-4 border-t border-gray-200">
//                   <h3 className="text-sm font-semibold text-gray-900 mb-2">Invoice Summary</h3>
//                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
//                     <div className="bg-gray-50 p-2 rounded">
//                       <p className="text-xs text-gray-500">Invoice Number</p>
//                       <p className="font-medium text-gray-900">{formData.invoiceNo}</p>
//                     </div>
//                     <div className="bg-gray-50 p-2 rounded">
//                       <p className="text-xs text-gray-500">Invoice Date</p>
//                       <p className="font-medium text-gray-900">{new Date(formData.invoiceDate).toLocaleDateString()}</p>
//                     </div>
//                     <div className="bg-gray-50 p-2 rounded">
//                       <p className="text-xs text-gray-500">Vehicle Number</p>
//                       <p className="font-medium text-gray-900">{formData.vehicleNo}</p>
//                     </div>
//                     <div className="bg-gray-50 p-2 rounded">
//                       <p className="text-xs text-gray-500">PO Number</p>
//                       <p className="font-medium text-gray-900">{formData.poNumber}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Barcode and Buttons */}
//               {formData.isSubmitted && (
//                 <div className="mt-6 pt-4 border-t border-gray-200">
//                   <div className="bg-green-50 rounded-lg p-4 text-center">
//                     <div className="flex items-center justify-center mb-2">
//                       <CheckCircle size={16} className="text-green-600 mr-1" />
//                       <span className="text-green-800 text-sm font-medium">EDI Submitted Successfully!</span>
//                     </div>

//                     <div
//                       className="rounded-lg p-3 mb-3 inline-block"
//                       style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
//                     >
//                       <img
//                         ref={barcodeRef}
//                         alt="barcode"
//                         style={{ display: 'block', height: '60px' }}
//                       />
//                     </div>

//                     <p className="text-xs text-gray-500 mb-3">SAP Delivery Document: {formData.barcode}</p>

//                     <div className="flex justify-center space-x-3">
//                       <button
//                         onClick={handlePrint}
//                         className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-1 text-sm"
//                       >
//                         <Printer size={14} />
//                         <span>Print</span>
//                       </button>
//                       <button
//                         onClick={resetForm}
//                         className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-1 text-sm"
//                       >
//                         <Plus size={14} />
//                         <span>Create New</span>
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </VendorLayout>
//   )
// }



'use client'

import { useState, useEffect, useRef } from 'react'
import VendorLayout from '@/components/vendor/VendorLayout'
import jsBarcode from 'jsbarcode'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import {
  Plus,
  X,
  Package,
  CheckCircle,
  Printer,
  Zap,
  RefreshCw,
  AlertCircle,
  XCircle
} from 'lucide-react'

interface LineItem {
  id: string
  lineNumber: number
  materialCode: string
  materialDesc: string
  uom: string
  quantity: number
  unitPrice: number
  totalAmount: number
}

interface PurchaseOrder {
  id: string
  poNumber: string
  poCreateDate: string
  plantCode: string
  status: string
  lineItems: LineItem[]
}

interface EDIInvoice {
  invoiceNo: string
  invoiceDate: string
  vehicleNo: string
  poNumber: string
  selectedPO: PurchaseOrder | null
  lineItemsData: {
    lineItemId: string
    materialCode: string
    materialDesc: string
    uom: string
    poQty: number
    unitPrice: number
    sapTotalPrice: number
    invoiceQty: number
    enteredTotalPrice: number
    isVerified: boolean
    isValid: boolean
    errorMessage: string
  }[]
  isSubmitted: boolean
  barcode: string
}

const formatCurrency = (value: any): string => {
  if (value === null || value === undefined || isNaN(value)) return '0.00'
  return Number(value).toFixed(2)
}

const safeNumber = (value: any): number => {
  if (value === null || value === undefined || isNaN(value)) return 0
  return Number(value)
}

export default function EDIManualPage() {
  const [showForm, setShowForm] = useState(false)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const barcodeRef = useRef<HTMLImageElement | null>(null)
  const printRef = useRef<HTMLDivElement | null>(null)

  const [formData, setFormData] = useState<EDIInvoice>({
    invoiceNo: '',
    invoiceDate: '',
    vehicleNo: '',
    poNumber: '',
    selectedPO: null,
    lineItemsData: [],
    isSubmitted: false,
    barcode: ''
  })

  useEffect(() => {
    fetchPurchaseOrders()
  }, [])

  useEffect(() => {
    if (formData.isSubmitted && formData.barcode) {
      setTimeout(() => {
        try {
          const offscreen = document.createElement('canvas')
          jsBarcode(offscreen, formData.barcode, {
            format: 'CODE128',
            width: 2.5,
            height: 60,
            displayValue: true,
            lineColor: '#000000',
            background: '#ffffff'
          })
          if (barcodeRef.current) {
            barcodeRef.current.src = offscreen.toDataURL('image/png')
          }
        } catch (error) {
          console.error('Barcode generation error:', error)
        }
      }, 100)
    }
  }, [formData.isSubmitted, formData.barcode])

  const fetchPurchaseOrders = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('vendorToken')
      if (!token) {
        setError('Not authenticated')
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/vendor/sap-purchase-orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.status === 401) {
        localStorage.removeItem('vendorToken')
        localStorage.removeItem('vendor')
        window.location.href = '/vendor-login'
        return
      }

      const data = await response.json()
      
      if (data.success) {
        setPurchaseOrders(data.data || [])
      } else {
        setError(data.error || 'Failed to fetch purchase orders')
      }
    } catch (error) {
      console.error('Error fetching POs:', error)
      setError('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  const handlePONumberChange = (poNumber: string) => {
    const selectedPO = purchaseOrders.find(po => po.poNumber === poNumber) || null

    const lineItemsData = selectedPO?.lineItems.map((item) => {
      const unitPrice = safeNumber(item.unitPrice)
      const quantity = safeNumber(item.quantity)
      const sapTotalPrice = unitPrice * quantity
      
      return {
        lineItemId: item.id || '',
        materialCode: item.materialCode || '',
        materialDesc: item.materialDesc || '',
        uom: item.uom || '',
        poQty: quantity,
        unitPrice: unitPrice,
        sapTotalPrice: sapTotalPrice,
        invoiceQty: 0,
        enteredTotalPrice: 0,
        isVerified: false,
        isValid: false,
        errorMessage: ''
      }
    }) || []

    setFormData({
      ...formData,
      poNumber,
      selectedPO,
      lineItemsData,
      invoiceNo: formData.invoiceNo || `INV-${Date.now()}`,
      invoiceDate: formData.invoiceDate || new Date().toISOString().split('T')[0]
    })
  }

  const handleInvoiceQtyChange = (index: number, value: number) => {
    const updatedLineItems = [...formData.lineItemsData]
    const item = updatedLineItems[index]
    const maxQty = item.poQty

    let invoiceQty = value
    if (invoiceQty > maxQty) {
      invoiceQty = maxQty
      alert(`Invoice quantity cannot exceed PO quantity (${maxQty})`)
    }

    item.invoiceQty = invoiceQty
    item.isVerified = false
    item.isValid = false
    item.errorMessage = ''

    setFormData({ ...formData, lineItemsData: updatedLineItems })
  }

  const handleEnteredTotalPriceChange = (index: number, value: number) => {
    const updatedLineItems = [...formData.lineItemsData]
    updatedLineItems[index].enteredTotalPrice = value
    updatedLineItems[index].isVerified = false
    updatedLineItems[index].isValid = false
    updatedLineItems[index].errorMessage = ''
    setFormData({ ...formData, lineItemsData: updatedLineItems })
  }

  const handleCheckLine = (index: number) => {
    const updatedLineItems = [...formData.lineItemsData]
    const item = updatedLineItems[index]

    if (item.invoiceQty <= 0) {
      item.errorMessage = 'Invoice quantity must be greater than 0'
      item.isValid = false
      item.isVerified = false
      setFormData({ ...formData, lineItemsData: updatedLineItems })
      return
    }

    if (item.enteredTotalPrice <= 0) {
      item.errorMessage = 'Total price must be greater than 0'
      item.isValid = false
      item.isVerified = false
      setFormData({ ...formData, lineItemsData: updatedLineItems })
      return
    }

    const expectedTotalPrice = item.unitPrice * item.invoiceQty
    const tolerance = 0.01
    const diff = Math.abs(item.enteredTotalPrice - expectedTotalPrice)
    const isPriceValid = diff <= (expectedTotalPrice * tolerance)

    if (isPriceValid) {
      item.isValid = true
      item.isVerified = true
      item.errorMessage = ''
    } else {
      item.isValid = false
      item.isVerified = false
      item.errorMessage = `Expected: ₹${formatCurrency(expectedTotalPrice)}`
    }

    setFormData({ ...formData, lineItemsData: updatedLineItems })
  }

  const allLinesVerified = () => {
    if (formData.lineItemsData.length === 0) return false
    return formData.lineItemsData.every(item => item.isVerified === true && item.isValid === true)
  }

  const handleSubmit = async () => {
    if (!allLinesVerified()) {
      alert('Please verify all line items before submitting')
      return
    }

    if (!formData.invoiceNo || !formData.invoiceDate || !formData.vehicleNo) {
      alert('Please fill all invoice details')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const token = localStorage.getItem('vendorToken')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/vendor/edi/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          poNumber: formData.poNumber,
          vehicleNo: formData.vehicleNo,
          invoiceNo: formData.invoiceNo,
          lineItems: formData.lineItemsData.map(item => ({
            poItemNumber: item.lineItemId,
            quantity: item.invoiceQty
          }))
        })
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Failed to submit EDI to SAP')
        setSubmitting(false)
        return
      }

      // Real SAP Inbound Delivery document number - not a locally generated one
      setFormData({
        ...formData,
        isSubmitted: true,
        barcode: data.data.deliveryDocument
      })
    } catch (err) {
      console.error('Error submitting EDI:', err)
      setError('Error connecting to server')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrint = () => {
    const printContent = printRef.current
    if (printContent) {
      const originalContents = document.body.innerHTML
      document.body.innerHTML = printContent.innerHTML
      window.print()
      document.body.innerHTML = originalContents
      window.location.reload()
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setFormData({
      invoiceNo: '',
      invoiceDate: '',
      vehicleNo: '',
      poNumber: '',
      selectedPO: null,
      lineItemsData: [],
      isSubmitted: false,
      barcode: ''
    })
  }

  const isFormValid = () => {
    return formData.invoiceNo &&
      formData.invoiceDate &&
      formData.vehicleNo &&
      formData.poNumber &&
      allLinesVerified()
  }

  const getMissingFieldsMessage = () => {
    const missing: string[] = []
    if (!formData.poNumber) missing.push('PO Number')
    if (!formData.invoiceNo) missing.push('Invoice Number')
    if (!formData.invoiceDate) missing.push('Invoice Date')
    if (!formData.vehicleNo) missing.push('Vehicle Number')
    if (formData.poNumber && !allLinesVerified()) missing.push('all line items checked (click "Check" on each)')
    if (missing.length === 0) return ''
    return `Still needed: ${missing.join(', ')}`
  }

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </VendorLayout>
    )
  }

  return (
    <VendorLayout>
      <div className="w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manual EDI</h1>
            <p className="text-gray-600 mt-1">Create and submit manual EDI invoices</p>
          </div>
          {!showForm && !formData.isSubmitted && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 text-sm"
            >
              <Plus size={18} />
              <span>Add Manual EDI</span>
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm">
            <AlertCircle size={16} className="mr-2" />
            {error}
          </div>
        )}

        {!loading && purchaseOrders.length === 0 && !showForm && !formData.isSubmitted && !error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Package size={40} className="mx-auto mb-3 text-gray-400" />
            <h3 className="text-base font-medium text-gray-900 mb-1">No Purchase Orders Found</h3>
            <p className="text-sm text-gray-500">You don't have any purchase orders to create EDI for.</p>
            <button
              onClick={fetchPurchaseOrders}
              className="mt-4 px-4 py-2 text-sm text-green-600 border border-green-200 rounded-lg hover:bg-green-50"
            >
              <RefreshCw size={14} className="inline mr-1" />
              Refresh from SAP
            </button>
          </div>
        )}

        {/* EDI Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Create EDI Invoice</h2>
              {!formData.isSubmitted && (
                <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Invoice Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.invoiceNo}
                  onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
                  placeholder="INV-2024-001"
                  disabled={formData.isSubmitted}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Invoice Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
                  disabled={formData.isSubmitted}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Vehicle Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.vehicleNo}
                  onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
                  placeholder="MH-12-AB-1234"
                  disabled={formData.isSubmitted}
                />
              </div>
            </div>

            {/* PO Selection */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Select PO Number <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.poNumber}
                onChange={(e) => handlePONumberChange(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
                disabled={formData.isSubmitted}
              >
                <option value="">-- Select Purchase Order --</option>
                {purchaseOrders.map(po => (
                  <option key={po.id} value={po.poNumber}>
                    {po.poNumber} - {po.plantCode}
                  </option>
                ))}
              </select>
            </div>

            {/* Line Items Table */}
            {formData.selectedPO && formData.lineItemsData.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Line Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-1.5 text-left">Material</th>
                        <th className="px-2 py-1.5 text-left">Description</th>
                        <th className="px-2 py-1.5 text-left w-10">UOM</th>
                        <th className="px-2 py-1.5 text-right w-14">PO Qty</th>
                        <th className="px-2 py-1.5 text-right w-16">Unit Price</th>
                        <th className="px-2 py-1.5 text-right w-20">Invoice Qty</th>
                        <th className="px-2 py-1.5 text-right w-24">Entered Total</th>
                        <th className="px-2 py-1.5 text-center w-16">Action</th>
                        <th className="px-2 py-1.5 text-center w-12">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {formData.lineItemsData.map((item, idx) => {
                        const isVerified = item.isVerified
                        const isValid = item.isValid
                        const hasError = !isValid && !isVerified && item.errorMessage

                        return (
                          <tr key={idx} className={isVerified && isValid ? 'bg-green-50' : hasError ? 'bg-red-50' : 'bg-white'}>
                            <td className="px-2 py-1.5 font-mono">{item.materialCode}</td>
                            <td className="px-2 py-1.5 truncate max-w-[120px]">{item.materialDesc}</td>
                            <td className="px-2 py-1.5">{item.uom}</td>
                            <td className="px-2 py-1.5 text-right font-medium">{item.poQty}</td>
                            <td className="px-2 py-1.5 text-right">₹{formatCurrency(item.unitPrice)}</td>
                            <td className="px-2 py-1.5">
                              <input
                                type="number"
                                value={item.invoiceQty || ''}
                                onChange={(e) => handleInvoiceQtyChange(idx, parseFloat(e.target.value) || 0)}
                                className={`w-full px-1 py-0.5 text-right text-xs border rounded bg-white focus:ring-1 focus:ring-green-500 ${hasError ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={formData.isSubmitted || isVerified}
                                placeholder="Qty"
                                step="1"
                                min="0"
                                max={item.poQty}
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="number"
                                value={item.enteredTotalPrice || ''}
                                onChange={(e) => handleEnteredTotalPriceChange(idx, parseFloat(e.target.value) || 0)}
                                className={`w-full px-1 py-0.5 text-right text-xs border rounded bg-white focus:ring-1 focus:ring-green-500 ${hasError ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={formData.isSubmitted || isVerified}
                                placeholder="Total"
                                step="0.01"
                                min="0"
                              />
                              {hasError && (
                                <div className="text-red-500 text-[10px] mt-0.5">{item.errorMessage}</div>
                              )}
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              {!formData.isSubmitted && !isVerified && (
                                <button
                                  onClick={() => handleCheckLine(idx)}
                                  disabled={!item.invoiceQty || !item.enteredTotalPrice}
                                  className={`px-2 py-0.5 rounded text-xs ${
                                    item.invoiceQty && item.enteredTotalPrice
                                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  }`}
                                >
                                  Check
                                </button>
                              )}
                              {isVerified && isValid && (
                                <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                  <CheckCircle size={10} className="mr-0.5" />
                                  OK
                                </span>
                              )}
                              {isVerified && !isValid && (
                                <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-red-800 bg-red-100 rounded-full">
                                  <XCircle size={10} className="mr-0.5" />
                                  Error
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              {isVerified && isValid ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-green-800 bg-green-100 rounded-full">✓</span>
                              ) : isVerified && !isValid ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-red-800 bg-red-100 rounded-full">✗</span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">Pending</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Submit Button */}
            {!formData.isSubmitted && (
              <div className="mt-4 flex justify-end items-center space-x-3">
                {!isFormValid() && !submitting && getMissingFieldsMessage() && (
                  <span className="text-xs text-amber-600">{getMissingFieldsMessage()}</span>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid() || submitting}
                  className={`px-4 py-1.5 rounded-lg flex items-center space-x-2 text-sm ${
                    isFormValid() && !submitting
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={14} />
                      <span>Submit EDI</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Print Area */}
            <div ref={printRef}>
              {/* Submitted Line Items */}
              {formData.isSubmitted && formData.lineItemsData.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Submitted Line Items</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-1.5 text-left">Material Code</th>
                          <th className="px-2 py-1.5 text-left">Description</th>
                          <th className="px-2 py-1.5 text-left">UOM</th>
                          <th className="px-2 py-1.5 text-right">Invoice Qty</th>
                          <th className="px-2 py-1.5 text-right">Total Price (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {formData.lineItemsData.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-2 py-1.5 font-mono">{item.materialCode}</td>
                            <td className="px-2 py-1.5">{item.materialDesc}</td>
                            <td className="px-2 py-1.5">{item.uom}</td>
                            <td className="px-2 py-1.5 text-right">{item.invoiceQty}</td>
                            <td className="px-2 py-1.5 text-right">₹{formatCurrency(item.enteredTotalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={4} className="px-2 py-1.5 text-right font-semibold">Total:</td>
                          <td className="px-2 py-1.5 text-right font-bold text-green-600">
                            ₹{formData.lineItemsData.reduce((sum, item) => sum + safeNumber(item.enteredTotalPrice), 0).toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* Invoice Summary */}
              {formData.isSubmitted && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Invoice Summary</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">Invoice Number</p>
                      <p className="font-medium text-gray-900">{formData.invoiceNo}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">Invoice Date</p>
                      <p className="font-medium text-gray-900">{new Date(formData.invoiceDate).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">Vehicle Number</p>
                      <p className="font-medium text-gray-900">{formData.vehicleNo}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">PO Number</p>
                      <p className="font-medium text-gray-900">{formData.poNumber}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Barcode and Buttons */}
              {formData.isSubmitted && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle size={16} className="text-green-600 mr-1" />
                      <span className="text-green-800 text-sm font-medium">EDI Submitted Successfully!</span>
                    </div>

                    <div
                      className="rounded-lg p-3 mb-3 inline-block"
                      style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
                    >
                      <img
                        ref={barcodeRef}
                        alt="barcode"
                        style={{ display: 'block', height: '60px' }}
                      />
                    </div>

                    <p className="text-xs text-gray-500 mb-3">SAP Delivery Document: {formData.barcode}</p>

                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={handlePrint}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-1 text-sm"
                      >
                        <Printer size={14} />
                        <span>Print</span>
                      </button>
                      <button
                        onClick={resetForm}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-1 text-sm"
                      >
                        <Plus size={14} />
                        <span>Create New</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </VendorLayout>
  )
}
