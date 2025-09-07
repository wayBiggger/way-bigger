export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

export interface User {
  id: number
  email: string
  username: string
  full_name: string
  selected_field?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export const auth = {
  // Get stored token
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token')
  },

  // Get stored user data
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  // Check if user is authenticated with token validation
  isAuthenticated: (): boolean => {
    const token = auth.getToken()
    if (!token) return false
    
    try {
      // Basic JWT validation - check if token is not expired
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      return payload.exp > currentTime
    } catch (error) {
      // If token is malformed, clear it
      auth.clearAuth()
      return false
    }
  },

  // Validate token with server
  validateToken: async (): Promise<boolean> => {
    const token = auth.getToken()
    if (!token) return false
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.ok
    } catch (error) {
      return false
    }
  },

  // Store auth data
  setAuth: (token: string, user: User): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem('access_token', token)
    localStorage.setItem('user', JSON.stringify(user))
  },

  // Clear auth data
  clearAuth: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    localStorage.removeItem('user_full_name')
    localStorage.removeItem('user_id')
  },

  // Login
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const urlEncoded = new URLSearchParams()
    urlEncoded.append('username', email)
    urlEncoded.append('password', password)

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: urlEncoded.toString()
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      let message = 'Login failed'
      try {
        const data = JSON.parse(text)
        message = data?.detail || message
      } catch (_) {
        if (text) message = text
      }
      throw new Error(message)
    }

    return response.json()
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    const token = auth.getToken()
    if (!token) throw new Error('No token found')

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch profile')
    }

    return response.json()
  },

  // Logout
  logout: async (): Promise<void> => {
    const token = auth.getToken()
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      } catch (error) {
        console.error('Logout request failed:', error)
      }
    }
    auth.clearAuth()
  }
}
