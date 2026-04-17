'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
export default function DmcRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/admin/dmcs') }, [])
  return null
}
