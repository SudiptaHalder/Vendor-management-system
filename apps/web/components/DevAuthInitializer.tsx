"use client"

import { useEffect } from 'react'
import { initDevAuth } from '@/lib/dev-auth'

export default function DevAuthInitializer() {
  useEffect(() => {
    initDevAuth()
  }, [])
  
  return null
}
