'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
export default function AdminRoot() {
  const router = useRouter()
  useEffect(() => {
    const admin = localStorage.getItem('riden_admin')
    if (admin) { router.replace('/admin/dashboard') } else { router.replace('/admin/login') }
  }, [router])
  return null
}
