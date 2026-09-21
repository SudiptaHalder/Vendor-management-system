'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  DollarSign,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  FileText,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart
} from 'lucide-react'
import Link from 'next/link'

interface FinancialReportData {
  summary: {
    totalInvoices: number
    totalPayments: number
    totalExpenses: number
    totalInvoiced: number
    totalPaid: number
    totalExpenses: number
    outstandingBalance: number
    netIncome: number
  }
  invoices: Array<{
    number: string
    vendor: string
    total: number
    status: string
    date: string
  }>
  filters: any
}

export default function FinancialReportsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reportData, setReportData] = useState<FinancialReportData | null>(null)
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear().toString())
  const [period, setPeriod] = useState('year')

  const generateReport = async () => {
    setLoading(true)
    setError('')
    try {
      // Calculate date range based on period
      const endDate = new Date()
      const startDate = new Date()
      
      if (period === 'year') {
        startDate.setFullYear(parseInt(fiscalYear), 0, 1)
        endDate.setFullYear(parseInt(fiscalYear), 11, 31)
      } else if (period === 'quarter') {
        // Current quarter
        const quarter = Math.floor(new Date().getMonth() / 3)
        startDate.setMonth(quarter * 3, 1)
        endDate.setMonth(quarter * 3 + 2, 0)
      } else if (period === 'month') {
        startDate.setMonth(new Date().getMonth(), 1)
        endDate.setMonth(new Date().getMonth() + 1, 0)
      }

      // Fetch data
      const [invoicesRes, paymentsRes, expensesRes] = await Promise.all([
        api.getInvoices(),
        api.getPayments(),
        api.getExpenses()
      ])

      const summary = {
        totalInvoices: invoicesRes.success ? invoicesRes.data.length : 0,
        totalPayments: paymentsRes.success ? paymentsRes.data.length : 0,
        totalExpenses: expensesRes.success ? expensesRes.data.length : 0,
        totalInvoiced: invoicesRes.success 
          ? invoicesRes.data.reduce((sum: number, inv: any) => sum + Number(inv.total), 0) 
          : 0,
        totalPaid: paymentsRes.success 
          ? paymentsRes.data.reduce((sum: number, p: any) => sum + (p.status === 'completed' ? Number(p.amount) : 0), 0) 
          : 0,
        totalExpensesAmount: expensesRes.success 
          ? expensesRes.data.reduce((sum: number, e: any) => sum + Number(e.amount), 0) 
          : 0,
        outstandingBalance: 0,
        netIncome: 0
      }

      summary.outstandingBalance = summary.totalInvoiced - summary.totalPaid
      summary.netIncome = summary.totalPaid - summary.totalExpensesAmount

      setReportData({
        summary,
        invoices: invoicesRes.success ? invoicesRes.data.slice(0, 10).map((inv: any) => ({
          number: inv.invoiceNumber,
          vendor: inv.vendor?.name || 'Unknown',
          total: inv.total,
          status: inv.status,
          date: inv.createdAt
        })) : [],
        filters: { fiscalYear, period }
      })
    } catch (err) {
      console.error('Error generating report:', err)
      setError('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    generateReport()
  }, [fiscalYear, period])

  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    alert(`Exporting as ${format.toUpperCase()}...`)
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link href="/reports" className="hover:text-blue-600 dark:hover:text-blue-400">
            Reports
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">Financial Reports</span>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Financial Reports</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track income, expenses, and financial performance</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
              <button
                onClick={() => handleExport('pdf')}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md flex items-center space-x-1"
              >
                <Download size={14} />
                <span>PDF</span>
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md flex items-center space-x-1"
              >
                <Download size={14} />
                <span>CSV</span>
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md flex items-center space-x-1"
              >
                <Download size={14} />
                <span>Excel</span>
              </button>
            </div>
            <button
              onClick={generateReport}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-2"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg flex items-center space-x-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
            >
              <option value="year">Fiscal Year</option>
              <option value="quarter">Current Quarter</option>
              <option value="month">Current Month</option>
            </select>
          </div>
          {period === 'year' && (
            <div className="flex items-center space-x-2">
              <select
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Invoiced</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    ${reportData.summary.totalInvoiced.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{reportData.summary.totalInvoices} invoices</p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    ${reportData.summary.totalPaid.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{reportData.summary.totalPayments} payments</p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                    ${reportData.summary.totalExpensesAmount.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{reportData.summary.totalExpenses} expenses</p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Income</p>
                  <p className={`text-2xl font-bold ${reportData.summary.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} mt-1`}>
                    ${Math.abs(reportData.summary.netIncome).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  {reportData.summary.netIncome >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {reportData.summary.netIncome >= 0 ? 'Profit' : 'Loss'}
              </p>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Outstanding Balance</h3>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  ${reportData.summary.outstandingBalance.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {((reportData.summary.outstandingBalance / reportData.summary.totalInvoiced) * 100).toFixed(1)}% of total
                </p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${(reportData.summary.outstandingBalance / reportData.summary.totalInvoiced) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Payment Collection</h3>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {((reportData.summary.totalPaid / reportData.summary.totalInvoiced) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Collection Rate</p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(reportData.summary.totalPaid / reportData.summary.totalInvoiced) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Invoices</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {reportData.invoices.map((invoice, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">{invoice.number}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-gray-100">{invoice.vendor}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(invoice.date).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          invoice.status === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                          invoice.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          ${Number(invoice.total).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  )
}