'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function DMCsPage() {
  const router = useRouter()
  const [loaded, setLoaded] = useState(false)