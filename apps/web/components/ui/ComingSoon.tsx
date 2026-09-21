"use client"

import { useRouter } from 'next/navigation'
import { Construction, ArrowLeft } from 'lucide-react'

export default function ComingSoon({ title }: { title: string }) {
  const router = useRouter()

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4">
        <Construction className="w-12 h-12 text-blue-600 dark:text-blue-400" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
        This page is under development. Check back soon for updates!
      </p>
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        <ArrowLeft size={16} />
        <span>Go Back</span>
      </button>
    </div>
  )
}
