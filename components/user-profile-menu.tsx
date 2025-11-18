"use client"

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  User,
  Settings,
  FileText,
  LogOut,
  Shield,
  Building,
  Stethoscope
} from 'lucide-react'
import { getProfileImageUrl, getUserInitials, getUserDisplayName } from '@/lib/profile-image-utils'

export function UserProfileMenu() {
  const { user, logout, profileVersion } = useAuth()
  const router = useRouter()

  // Debug logging
  console.log('UserProfileMenu - user data:', user)

  const rawProfileImageUrl = getProfileImageUrl(user?.profileImageUrl)
  const profileAvatarSrc = rawProfileImageUrl
    ? `${rawProfileImageUrl}${rawProfileImageUrl.includes('?') ? '&' : '?'}pv=${profileVersion}`
    : undefined

  if (!user) {
    console.log('UserProfileMenu - no user data')
    return null
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleProfileEdit = () => {
    router.push('/profile/edit')
  }

  const handleMyReports = () => {
    router.push('/profile/reports')
  }

  const getRoleIcon = (role: string | undefined) => {
    if (!role) return <User className="w-4 h-4" />
    switch (role.toLowerCase()) {
      case 'shelter':
        return <Building className="w-4 h-4" />
      case 'veterinarian':
        return <Stethoscope className="w-4 h-4" />
      case 'admin':
        return <Shield className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getRoleLabel = (role: string | undefined) => {
    if (!role) return 'Citizen'
    switch (role.toLowerCase()) {
      case 'shelter':
        return 'Shelter'
      case 'veterinarian':
        return 'Veterinarian'
      case 'admin':
        return 'Admin'
      default:
        return 'Citizen'
    }
  }



  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profileAvatarSrc} alt={getUserDisplayName(user.firstName, user.lastName)} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getUserInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">
                {user.firstName} {user.lastName}
              </p>
              <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full">
                {getRoleIcon(user.role)}
                <span className="text-xs text-muted-foreground">
                  {getRoleLabel(user.role)}
                </span>
              </div>
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {user.phone && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.phone}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs">
              {user.isVerified !== undefined ? (
                user.isVerified ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                    Verified
                  </span>
                ) : (
                  <span className="text-yellow-600 flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full" />
                    Unverified
                  </span>
                )
              ) : null}
              {user.isActive !== undefined ? (
                user.isActive ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                    Active
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-600 rounded-full" />
                    Inactive
                  </span>
                )
              ) : null}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfileEdit} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Edit Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleMyReports} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" />
          <span>My Reports</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
