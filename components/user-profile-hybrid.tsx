"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { UserProfileMenu } from './user-profile-menu'
import { UserProfileSidebar } from './user-profile-sidebar'

export function UserProfileHybrid() {
  const { user } = useAuth()

  if (!user) return null

  // Use the sidebar profile component
  return <UserProfileSidebar />
}
