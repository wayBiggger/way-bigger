import { useState, useEffect, useCallback } from 'react'
import { auth, User } from '@/utils/auth'

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  error: string | null
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null
  })

  const checkAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const token = auth.getToken()
      const user = auth.getUser()
      
      if (!token || !user) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null
        })
        return
      }

      // Validate token with server
      const isValid = await auth.validateToken()
      
      if (!isValid) {
        auth.clearAuth()
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null
        })
        return
      }

      setAuthState({
        isAuthenticated: true,
        user,
        isLoading: false,
        error: null
      })
    } catch (error) {
      console.error('Auth check error:', error)
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: 'Authentication check failed'
      })
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const response = await auth.login(email, password)
      auth.setAuth(response.access_token, response.user)
      
      setAuthState({
        isAuthenticated: true,
        user: response.user,
        isLoading: false,
        error: null
      })
      
      return response
    } catch (error: any) {
      const errorMessage = error?.message || 'Login failed'
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      await auth.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null
      })
    }
  }, [])

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }))
  }, [])

  useEffect(() => {
    checkAuth()

    // Listen for storage changes (e.g., when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuth()
    }

    // Listen for auth status changes (e.g., from OAuth callbacks)
    const handleAuthStatusChange = (event: CustomEvent) => {
      if (event.detail?.authenticated) {
        checkAuth()
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null
        })
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('authStatusChange', handleAuthStatusChange as EventListener)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authStatusChange', handleAuthStatusChange as EventListener)
    }
  }, [checkAuth])

  return {
    ...authState,
    login,
    logout,
    checkAuth,
    clearError
  }
}
