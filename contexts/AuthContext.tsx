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
  organizationId?: string
  organizationName?: string
  organizationRole?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  /** increments whenever we successfully refresh the user profile */
  profileVersion: number
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [profileVersion, setProfileVersion] = useState(0)

  const isAuthenticated = !!user

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Check both localStorage and sessionStorage for token
      let token = localStorage.getItem('auth_token')
      if (!token) {
        token = sessionStorage.getItem('auth_token')
      }

      if (token) {
        apiClient.setToken(token)
        await refreshUser()
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await apiClient.login(email, password)

      if (response.error) {
        return { success: false, error: response.error }
      }

      if (response.data?.success && response.data?.token && response.data?.user) {
        // Store token based on remember me preference
        if (rememberMe) {
          localStorage.setItem('auth_token', response.data.token)
          sessionStorage.removeItem('auth_token') // Clear session storage
        } else {
          sessionStorage.setItem('auth_token', response.data.token)
          localStorage.removeItem('auth_token') // Clear local storage
        }

        // Set token for subsequent requests
        apiClient.setToken(response.data.token)

        // Always load the full, up-to-date user profile from /auth/profile
        // so avatar/profile image and organization info are consistent
        await refreshUser()

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
    // Clear tokens from both storages
    localStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_token')
    apiClient.clearToken()
    setUser(null)
    setProfileVersion(0)
  }

  const refreshUser = async () => {
    try {
      const response = await apiClient.getProfile()
      if (response.data) {
        setUser(response.data)
        setProfileVersion((prev) => prev + 1)
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
    profileVersion,
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
