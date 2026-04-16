'use client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  function enterDemo() {
    localStorage.setItem('riden_user', JSON.stringify({ email: 'demo@riden.me', name: 'Demo User' }))
    router.push('/admin/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      padding: 20
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        padding: 40,
        background: '#141414',
        borderRadius: 16,
        border: '1px solid #222'
      }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          color: '#fff',
          marginBottom: 8,
          textAlign: 'center'
        }}>
          RIDEN
        </h1>
        <p style={{
          fontSize: 14,
          color: '#888',
          marginBottom: 32,
          textAlign: 'center'
        }}>
          B2B Tourism Transport Platform
        </p>

        <button
          onClick={enterDemo}
          style={{
            width: '100%',
            padding: 16,
            fontSize: 18,
            fontWeight: 700,
            color: '#000',
            background: '#00d9a3',
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer'
          }}
        >
          ENTER DEMO
        </button>

        <p style={{
          fontSize: 12,
          color: '#555',
          marginTop: 24,
          textAlign: 'center'
        }}>
          Click the button above to access the admin dashboard
        </p>
      </div>
    </div>
  )
}
