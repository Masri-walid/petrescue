"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  profileImageUrl?: string
  isActive: boolean
  isVerified: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        apiClient.setToken(token)
        await refreshUser()
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password)

      if (response.error) {
        return { success: false, error: response.error }
      }

      if (response.data?.success && response.data?.token && response.data?.user) {
        apiClient.setToken(response.data.token)
        setUser(response.data.user)
        return { success: true }
      }

      if (response.data?.success === false) {
        return { success: false, error: response.data.message || 'Login failed' }
      }

      return { success: false, error: 'Invalid response from server' }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }

  const logout = () => {
    apiClient.clearToken()
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const response = await apiClient.getProfile()
      if (response.data) {
        setUser(response.data)
      } else {
        // Token might be invalid
        logout()
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
      logout()
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
