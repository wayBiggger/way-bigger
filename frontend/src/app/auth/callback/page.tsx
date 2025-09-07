'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/utils/auth'

export default function AuthCallbackPage() {
  const [message, setMessage] = useState('Signing you in...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const token = params.get('token')
        
        if (!token) {
          setError('No token provided. Please try logging in again.')
          return
        }

        // Get user data from URL params if available
        const userParam = params.get('user')
        let userData = null
        
        if (userParam) {
          try {
            const decodedUser = decodeURIComponent(userParam)
            const userParams = new URLSearchParams(decodedUser)
            userData = {
              id: parseInt(userParams.get('id') || '0'),
              email: userParams.get('email') || '',
              username: userParams.get('username') || '',
              full_name: userParams.get('full_name') || ''
            }
          } catch (e) {
            console.warn('Failed to parse user data from URL:', e)
          }
        }

        // Validate token and get user data
        try {
          // Store token temporarily
          localStorage.setItem('access_token', token)
          
          // If we have user data from URL, use it; otherwise fetch from server
          if (userData) {
            // Store complete auth data
            auth.setAuth(token, userData)
            setMessage('Login successful. Redirecting...')
            setTimeout(() => { 
              window.location.href = '/profile' 
            }, 1000)
          } else {
            // Fallback: fetch user profile to validate token and get user data
            const userProfile = await auth.getProfile()
            auth.setAuth(token, userProfile)
            setMessage('Login successful. Redirecting...')
            setTimeout(() => { 
              window.location.href = '/profile' 
            }, 1000)
          }
          
        } catch (profileError) {
          // Token is invalid, clear it
          auth.clearAuth()
          setError('Invalid token. Please try logging in again.')
        }
        
      } catch (e) {
        console.error('OAuth callback error:', e)
        setError('Something went wrong. Please try again.')
      }
    }

    handleOAuthCallback()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {error ? (
            <div className="text-red-600 bg-red-50 p-4 rounded-md">
              <p className="font-medium">Authentication Error</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={() => window.location.href = '/auth/login'}
                className="mt-3 text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="text-gray-700">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


