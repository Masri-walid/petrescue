"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { UserProfileMenu } from './user-profile-menu'
import { UserProfileSidebar } from './user-profile-sidebar'

export function UserProfileHybrid() {
  const { user } = useAuth()
  const [useDropdown, setUseDropdown] = useState(true)

  if (!user) return null

  // Always try dropdown first, but provide sidebar as immediate alternative
  // Remove the intermediate "Use Sidebar" button - let users choose directly
  return <UserProfileSidebar />
}
