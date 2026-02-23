'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  FolderOpen,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  PieChart
} from 'lucide-react'
import Link from 'next/link'

interface ProjectReportData {
  summary: {
    totalProjects: number
    activeProjects: number
    completedProjects: number
    onHoldProjects: number
    totalBudget: number
    totalCost: number
    variance: number
  }
  projects: Array<{
    number: string
    name: string
    status: string
    priority: string
    manager: string
    budget: number
    actualCost: number
    progress: number
  }>
  filters: any
}

export default function ProjectReportsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reportData, setReportData] = useState<ProjectReportData | null>(null)
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')

  const generateReport = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.getProjects()
      
      if (response.success) {
        const projects = response.data
        
        // Apply filters
        let filteredProjects = projects
        if (status !== 'all') {
          filteredProjects = filteredProjects.filter((p: any) => p.status === status)
        }
        if (priority !== 'all') {
          filteredProjects = filteredProjects.filter((p: any) => p.priority === priority)
        }

        const summary = {
          totalProjects: filteredProjects.length,
          activeProjects: filteredProjects.filter((p: any) => p.status === 'active').length,
          completedProjects: filteredProjects.filter((p: any) => p.status === 'completed').length,
          onHoldProjects: filteredProjects.filter((p: any) => p.status === 'on_hold').length,
          totalBudget: filteredProjects.reduce((sum: number, p: any) => sum + Number(p.budget || 0), 0),
          totalCost: filteredProjects.reduce((sum: number, p: any) => sum + Number(p.actualCost || 0), 0),
          variance: 0
        }
        summary.variance = summary.totalBudget - summary.totalCost

        const projectList = filteredProjects.map((p: any) => ({
          number: p.projectNumber,
          name: p.name,
          status: p.status,
          priority: p.priority,
          manager: p.manager?.name || 'Unassigned',
          budget: Number(p.budget || 0),
          actualCost: Number(p.actualCost || 0),
          progress: p.progressPercent || 0
        }))

        setReportData({
          summary,
          projects: projectList,
          filters: { status, priority }
        })
      }
    } catch (err) {
      console.error('Error generating report:', err)
      setError('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    generateReport()
  }, [status, priority])

  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    alert(`Exporting as ${format.toUpperCase()}...`)
  }

  if (loading) {
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
          <Link href="/reports" className="hover:text-blue-600">
            Reports
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Project Reports</span>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Reports</h1>
            <p className="text-gray-600 mt-1">Track project performance, budget, and progress</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => handleExport('pdf')}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-1"
              >
                <Download size={14} />
                <span>PDF</span>
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-1"
              >
                <Download size={14} />
                <span>CSV</span>
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-1"
              >
                <Download size={14} />
                <span>Excel</span>
              </button>
            </div>
            <button
              onClick={generateReport}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.summary.totalProjects}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FolderOpen className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{reportData.summary.activeProjects}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{reportData.summary.completedProjects}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">On Hold</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{reportData.summary.onHoldProjects}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Budget Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Budget vs Actual</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Budget</span>
                    <span className="font-medium text-gray-900">${reportData.summary.totalBudget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Actual Cost</span>
                    <span className="font-medium text-gray-900">${reportData.summary.totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="font-medium text-gray-700">Variance</span>
                    <span className={`font-medium ${reportData.summary.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${Math.abs(reportData.summary.variance).toLocaleString()}
                      {reportData.summary.variance >= 0 ? ' (Under)' : ' (Over)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Project Status Distribution</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Active</span>
                    <span className="font-medium text-gray-900">{reportData.summary.activeProjects}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(reportData.summary.activeProjects / reportData.summary.totalProjects) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-medium text-gray-900">{reportData.summary.completedProjects}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(reportData.summary.completedProjects / reportData.summary.totalProjects) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">On Hold</span>
                    <span className="font-medium text-gray-900">{reportData.summary.onHoldProjects}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${(reportData.summary.onHoldProjects / reportData.summary.totalProjects) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Project Details</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Progress</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budget</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actual</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.projects.map((project) => {
                    const variance = project.budget - project.actualCost
                    return (
                      <tr key={project.number} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono font-medium text-gray-900">{project.number}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{project.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            project.status === 'active' ? 'bg-green-100 text-green-800' :
                            project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            project.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            project.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            project.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{project.manager}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <span className="text-sm text-gray-900">{project.progress}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-gray-900">${project.budget.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-gray-900">${project.actualCost.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-sm font-medium ${
                            variance >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ${Math.abs(variance).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  )
}