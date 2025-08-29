'use client'

import { useEffect, useState } from 'react'

export default function AuthCallbackPage() {
  const [message, setMessage] = useState('Signing you in...')

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')
      if (token) {
        localStorage.setItem('access_token', token)
        setMessage('Login successful. Redirecting...')
        setTimeout(() => { window.location.href = '/' }, 1000)
      } else {
        setMessage('No token provided. Please try logging in again.')
      }
    } catch (e) {
      setMessage('Something went wrong. Please try again.')
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-700">{message}</p>
    </div>
  )
}


