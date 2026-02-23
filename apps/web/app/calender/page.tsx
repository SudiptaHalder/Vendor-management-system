// 'use client'

// import { useState, useEffect } from 'react'
// import MainLayout from '@/components/layout/MainLayout'
// import { api } from '@/lib/api'
// import {
//   Calendar as CalendarIcon,
//   ChevronLeft,
//   ChevronRight,
//   Plus,
//   Clock,
//   MapPin,
//   Users,
//   FileText,
//   Filter,
//   Search,
//   Loader2,
//   AlertCircle,
//   CheckCircle,
//   XCircle,
//   Download,
//   Edit,
//   Trash2,
//   Eye,
//   X
// } from 'lucide-react'
// import Link from 'next/link'

// interface CalendarEvent {
//   id: string
//   title: string
//   description?: string
//   startTime: string
//   endTime: string
//   isAllDay: boolean
//   location?: string
//   status: string
//   type: string
//   workOrderId?: string
//   projectId?: string
//   scheduleId?: string
//   assignedTo?: {
//     id: string
//     name: string
//   }
// }

// export default function CalendarPage() {
//   const [currentDate, setCurrentDate] = useState(new Date())
//   const [events, setEvents] = useState<CalendarEvent[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const [view, setView] = useState<'month' | 'week' | 'day'>('month')
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null)
//   const [showEventModal, setShowEventModal] = useState(false)
//   const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [filterType, setFilterType] = useState('all')

//   useEffect(() => {
//     fetchEvents()
//   }, [currentDate, view])

//   const fetchEvents = async () => {
//     setLoading(true)
//     setError('')
//     try {
//       // Calculate date range based on view
//       const startDate = new Date(currentDate)
//       const endDate = new Date(currentDate)

//       if (view === 'month') {
//         startDate.setDate(1)
//         startDate.setHours(0, 0, 0, 0)
//         endDate.setMonth(endDate.getMonth() + 1)
//         endDate.setDate(0)
//         endDate.setHours(23, 59, 59, 999)
//       } else if (view === 'week') {
//         const day = currentDate.getDay()
//         startDate.setDate(currentDate.getDate() - day)
//         startDate.setHours(0, 0, 0, 0)
//         endDate.setDate(startDate.getDate() + 6)
//         endDate.setHours(23, 59, 59, 999)
//       } else if (view === 'day') {
//         startDate.setHours(0, 0, 0, 0)
//         endDate.setHours(23, 59, 59, 999)
//       }

//       // Fetch schedules
//       const schedulesRes = await api.getSchedules()
//       let allEvents: CalendarEvent[] = []

//       // Add schedule items
//       if (schedulesRes.success) {
//         schedulesRes.data.forEach((schedule: any) => {
//           if (schedule.items && Array.isArray(schedule.items)) {
//             schedule.items.forEach((item: any) => {
//               const itemDate = new Date(item.startTime)
//               if (itemDate >= startDate && itemDate <= endDate) {
//                 allEvents.push({
//                   id: item.id,
//                   title: item.title,
//                   description: item.description,
//                   startTime: item.startTime,
//                   endTime: item.endTime,
//                   isAllDay: item.isAllDay || false,
//                   location: item.location,
//                   status: item.status,
//                   type: 'schedule',
//                   scheduleId: schedule.id,
//                   projectId: schedule.projectId,
//                   assignedTo: item.assignedTo
//                 })
//               }
//             })
//           }
//         })
//       }

//       // Fetch work orders for due dates
//       const workOrdersRes = await api.getWorkOrders()
//       if (workOrdersRes.success) {
//         workOrdersRes.data.forEach((wo: any) => {
//           if (wo.dueDate) {
//             const dueDate = new Date(wo.dueDate)
//             if (dueDate >= startDate && dueDate <= endDate) {
//               allEvents.push({
//                 id: `wo-${wo.id}`,
//                 title: `Due: ${wo.title}`,
//                 description: wo.description,
//                 startTime: wo.dueDate,
//                 endTime: wo.dueDate,
//                 isAllDay: true,
//                 status: wo.status,
//                 type: 'work-order',
//                 workOrderId: wo.id,
//                 projectId: wo.projectId
//               })
//             }
//           }
//         })
//       }

//       // Sort events by start time
//       allEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
//       setEvents(allEvents)
//     } catch (err) {
//       console.error('Error fetching events:', err)
//       setError('Failed to load calendar events')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const getDaysInMonth = () => {
//     const year = currentDate.getFullYear()
//     const month = currentDate.getMonth()
//     const firstDay = new Date(year, month, 1)
//     const lastDay = new Date(year, month + 1, 0)
    
//     const days = []
//     const startPadding = firstDay.getDay()
    
//     // Add padding days from previous month
//     for (let i = 0; i < startPadding; i++) {
//       days.push(null)
//     }
    
//     // Add days of current month
//     for (let i = 1; i <= lastDay.getDate(); i++) {
//       days.push(new Date(year, month, i))
//     }
    
//     return days
//   }

//   const getEventsForDate = (date: Date) => {
//     return events.filter(event => {
//       const eventDate = new Date(event.startTime)
//       return eventDate.toDateString() === date.toDateString()
//     })
//   }

//   const getEventColor = (type: string, status: string) => {
//     if (type === 'schedule') {
//       const statusColors: Record<string, string> = {
//         scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
//         in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
//         completed: 'bg-green-100 text-green-800 border-green-200',
//         cancelled: 'bg-red-100 text-red-800 border-red-200'
//       }
//       return statusColors[status] || 'bg-blue-100 text-blue-800 border-blue-200'
//     } else if (type === 'work-order') {
//       const statusColors: Record<string, string> = {
//         pending: 'bg-purple-100 text-purple-800 border-purple-200',
//         in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
//         completed: 'bg-green-100 text-green-800 border-green-200',
//         cancelled: 'bg-red-100 text-red-800 border-red-200'
//       }
//       return statusColors[status] || 'bg-purple-100 text-purple-800 border-purple-200'
//     }
//     return 'bg-gray-100 text-gray-800 border-gray-200'
//   }

//   const navigateMonth = (direction: 'prev' | 'next') => {
//     const newDate = new Date(currentDate)
//     if (direction === 'prev') {
//       newDate.setMonth(newDate.getMonth() - 1)
//     } else {
//       newDate.setMonth(newDate.getMonth() + 1)
//     }
//     setCurrentDate(newDate)
//   }

//   const handleEventClick = (event: CalendarEvent) => {
//     setSelectedEvent(event)
//     setShowEventModal(true)
//   }

//   const filteredEvents = events.filter(event => {
//     const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          (event.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
//     const matchesType = filterType === 'all' || event.type === filterType
//     return matchesSearch && matchesType
//   })

//   const getStatusBadge = (status: string) => {
//     const colors: Record<string, string> = {
//       scheduled: 'bg-blue-100 text-blue-800',
//       in_progress: 'bg-yellow-100 text-yellow-800',
//       completed: 'bg-green-100 text-green-800',
//       cancelled: 'bg-red-100 text-red-800',
//       pending: 'bg-purple-100 text-purple-800'
//     }
//     return (
//       <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
//         {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
//       </span>
//     )
//   }

//   if (loading) {
//     return (
//       <MainLayout>
//         <div className="flex items-center justify-center h-64">
//           <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
//         </div>
//       </MainLayout>
//     )
//   }

//   return (
//     <MainLayout>
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
//           <p className="text-gray-600 mt-1">Manage your schedule and upcoming events</p>
//         </div>
//         <div className="flex items-center space-x-3">
//           <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
//             <button
//               onClick={() => setView('month')}
//               className={`px-3 py-1.5 text-sm font-medium rounded-md ${
//                 view === 'month' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               Month
//             </button>
//             <button
//               onClick={() => setView('week')}
//               className={`px-3 py-1.5 text-sm font-medium rounded-md ${
//                 view === 'week' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               Week
//             </button>
//             <button
//               onClick={() => setView('day')}
//               className={`px-3 py-1.5 text-sm font-medium rounded-md ${
//                 view === 'day' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               Day
//             </button>
//           </div>
//           <Link
//             href="/schedules/new"
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
//           >
//             <Plus size={18} />
//             <span>New Event</span>
//           </Link>
//         </div>
//       </div>

//       {error && (
//         <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2">
//           <AlertCircle size={16} />
//           <span>{error}</span>
//         </div>
//       )}

//       {/* Search and Filter */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
//         <div className="flex flex-col lg:flex-row lg:items-center gap-4">
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search events..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
//             />
//           </div>
//           <div className="flex items-center space-x-4">
//             <select
//               value={filterType}
//               onChange={(e) => setFilterType(e.target.value)}
//               className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
//             >
//               <option value="all">All Events</option>
//               <option value="schedule">Schedules</option>
//               <option value="work-order">Work Orders</option>
//             </select>
//             <button className="p-2 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
//               <Filter size={16} />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Calendar Controls */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={() => navigateMonth('prev')}
//               className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
//             >
//               <ChevronLeft size={20} />
//             </button>
//             <h2 className="text-xl font-semibold text-gray-900">
//               {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
//             </h2>
//             <button
//               onClick={() => navigateMonth('next')}
//               className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
//             >
//               <ChevronRight size={20} />
//             </button>
//           </div>
//           <button
//             onClick={() => setCurrentDate(new Date())}
//             className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
//           >
//             Today
//           </button>
//         </div>
//       </div>

//       {/* Calendar Grid */}
//       {view === 'month' && (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//           {/* Weekday headers */}
//           <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
//             {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
//               <div key={day} className="px-4 py-3 text-sm font-medium text-gray-500 text-center">
//                 {day}
//               </div>
//             ))}
//           </div>

//           {/* Calendar days */}
//           <div className="grid grid-cols-7 divide-x divide-y divide-gray-200">
//             {getDaysInMonth().map((date, index) => (
//               <div
//                 key={index}
//                 className={`min-h-[120px] p-2 ${
//                   date && date.toDateString() === new Date().toDateString()
//                     ? 'bg-blue-50'
//                     : date ? 'bg-white' : 'bg-gray-50'
//                 }`}
//               >
//                 {date && (
//                   <>
//                     <div className="flex justify-between items-start mb-2">
//                       <span className={`text-sm font-medium ${
//                         date.toDateString() === new Date().toDateString()
//                           ? 'text-blue-600'
//                           : 'text-gray-700'
//                       }`}>
//                         {date.getDate()}
//                       </span>
//                       <Link
//                         href={`/schedules/new?date=${date.toISOString().split('T')[0]}`}
//                         className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
//                       >
//                         <Plus size={14} />
//                       </Link>
//                     </div>

//                     <div className="space-y-1 max-h-[80px] overflow-y-auto">
//                       {getEventsForDate(date).map((event) => (
//                         <button
//                           key={event.id}
//                           onClick={() => handleEventClick(event)}
//                           className={`w-full text-left px-2 py-1 text-xs rounded border ${getEventColor(event.type, event.status)} truncate hover:opacity-80 transition-opacity`}
//                         >
//                           {event.isAllDay ? '📅 ' : '🕐 '}
//                           {event.title.length > 20 ? event.title.substring(0, 20) + '...' : event.title}
//                         </button>
//                       ))}
//                     </div>
//                   </>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Week/Day View Placeholder */}
//       {(view === 'week' || view === 'day') && (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
//           <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//           <h3 className="text-lg font-medium text-gray-900 mb-2">Week and Day Views Coming Soon</h3>
//           <p className="text-gray-500">
//             We're working on bringing you week and day views. Stay tuned!
//           </p>
//         </div>
//       )}

//       {/* Event Details Modal */}
//       {showEventModal && selectedEvent && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
//             <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
//               <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
//               <button
//                 onClick={() => {
//                   setShowEventModal(false)
//                   setSelectedEvent(null)
//                 }}
//                 className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="p-6 space-y-4">
//               <div>
//                 <h4 className="text-xl font-semibold text-gray-900">{selectedEvent.title}</h4>
//                 {selectedEvent.description && (
//                   <p className="text-gray-600 mt-2">{selectedEvent.description}</p>
//                 )}
//               </div>

//               <div className="space-y-3">
//                 <div className="flex items-start space-x-3">
//                   <Clock size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
//                   <div>
//                     <p className="text-sm text-gray-900">
//                       {selectedEvent.isAllDay ? (
//                         'All day'
//                       ) : (
//                         <>
//                           {new Date(selectedEvent.startTime).toLocaleString()} - 
//                           {new Date(selectedEvent.endTime).toLocaleTimeString()}
//                         </>
//                       )}
//                     </p>
//                   </div>
//                 </div>

//                 {selectedEvent.location && (
//                   <div className="flex items-start space-x-3">
//                     <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
//                     <p className="text-sm text-gray-900">{selectedEvent.location}</p>
//                   </div>
//                 )}

//                 {selectedEvent.assignedTo && (
//                   <div className="flex items-start space-x-3">
//                     <Users size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
//                     <p className="text-sm text-gray-900">Assigned to: {selectedEvent.assignedTo.name}</p>
//                   </div>
//                 )}

//                 {selectedEvent.workOrderId && (
//                   <div className="flex items-start space-x-3">
//                     <FileText size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
//                     <Link
//                       href={`/work-orders/${selectedEvent.workOrderId}`}
//                       className="text-sm text-blue-600 hover:text-blue-800"
//                       onClick={() => setShowEventModal(false)}
//                     >
//                       View Work Order
//                     </Link>
//                   </div>
//                 )}

//                 {selectedEvent.projectId && (
//                   <div className="flex items-start space-x-3">
//                     <FileText size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
//                     <Link
//                       href={`/projects/${selectedEvent.projectId}`}
//                       className="text-sm text-blue-600 hover:text-blue-800"
//                       onClick={() => setShowEventModal(false)}
//                     >
//                       View Project
//                     </Link>
//                   </div>
//                 )}

//                 {selectedEvent.scheduleId && (
//                   <div className="flex items-start space-x-3">
//                     <FileText size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
//                     <Link
//                       href={`/schedules/${selectedEvent.scheduleId}`}
//                       className="text-sm text-blue-600 hover:text-blue-800"
//                       onClick={() => setShowEventModal(false)}
//                     >
//                       View Schedule
//                     </Link>
//                   </div>
//                 )}
//               </div>

//               <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
//                 <div className="flex items-center space-x-2">
//                   <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventColor(selectedEvent.type, selectedEvent.status)}`}>
//                     {selectedEvent.type === 'schedule' ? 'Schedule' : 'Work Order'}
//                   </span>
//                   {getStatusBadge(selectedEvent.status)}
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <Link
//                     href={
//                       selectedEvent.type === 'schedule'
//                         ? `/schedules/${selectedEvent.scheduleId}/edit`
//                         : `/work-orders/${selectedEvent.workOrderId}/edit`
//                     }
//                     className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
//                   >
//                     <Edit size={16} />
//                   </Link>
//                   <button className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
//                     <Trash2 size={16} />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </MainLayout>
//   )
// }
'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

export default function CalendarPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600 mt-1">Coming soon...</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar View Coming Soon</h3>
        <p className="text-gray-500">
          We're working on bringing you a full-featured calendar. Stay tuned!
        </p>
      </div>
    </MainLayout>
  )
}