"use client"

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getProfileImageUrl, getUserInitials, getUserDisplayName } from '@/lib/profile-image-utils'
import {
  User,
  Settings,
  FileText,
  LogOut,
  Shield,
  Building,
  Stethoscope,
  X,
  PlusCircle,
  AlertTriangle,
  Heart
} from 'lucide-react'

export function UserProfileSidebar() {
  const { user, logout, profileVersion } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  const rawProfileImageUrl = getProfileImageUrl(user.profileImageUrl)
  const profileAvatarSrc = rawProfileImageUrl
    ? `${rawProfileImageUrl}${rawProfileImageUrl.includes('?') ? '&' : '?'}pv=${profileVersion}`
    : undefined

  const handleLogout = () => {
    logout()
    router.push('/')
    setIsOpen(false)
  }

  const handleProfileEdit = () => {
    router.push('/profile/edit')
    setIsOpen(false)
  }

  const handleMyReports = () => {
    router.push('/user-reports')
    setIsOpen(false)
  }

  const handleAddAnimal = () => {
    router.push('/animals/add')
    setIsOpen(false)
  }

  const handleMyAnimals = () => {
    router.push('/profile/animals')
    setIsOpen(false)
  }

  const handleProfile = () => {
    router.push('/profile')
    setIsOpen(false)
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
    <>
      {/* Trigger Button */}
      <Button 
        variant="ghost" 
        className="relative h-10 w-10 rounded-full"
        onClick={() => setIsOpen(true)}
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={profileAvatarSrc} alt={getUserDisplayName(user.firstName, user.lastName)} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getUserInitials(user.firstName, user.lastName)}
          </AvatarFallback>
        </Avatar>
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 z-50' : 'translate-x-full -z-10 pointer-events-none opacity-0'
        }`}
        style={{
          visibility: isOpen ? 'visible' : 'hidden'
        }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Profile</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* User Info */}
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarImage src={profileAvatarSrc} alt={getUserDisplayName(user.firstName, user.lastName)} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {getUserInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>

            <div className="text-center">
              <div className="flex items-center gap-2 justify-center mb-2">
                <h3 className="text-lg font-medium">
                  {user.firstName} {user.lastName}
                </h3>
                <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full">
                  {getRoleIcon(user.role)}
                  <span className="text-xs text-muted-foreground">
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                {user.email}
              </p>
              
              {user.phone && (
                <p className="text-sm text-muted-foreground mb-2">
                  {user.phone}
                </p>
              )}

              {/* Status indicators */}
              <div className="flex items-center justify-center gap-3 text-xs">
                {user.isVerified !== undefined && (
                  <span className={`flex items-center gap-1 ${user.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${user.isVerified ? 'bg-green-600' : 'bg-yellow-600'}`} />
                    {user.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                )}
                {user.isActive !== undefined && (
                  <span className={`flex items-center gap-1 ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-600' : 'bg-red-600'}`} />
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleProfile}
            >
              <User className="mr-3 h-4 w-4" />
              My Profile
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleProfileEdit}
            >
              <Settings className="mr-3 h-4 w-4" />
              Edit Profile
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleMyReports}
            >
              <FileText className="mr-3 h-4 w-4" />
              My Reports
            </Button>

            {/* Animal management buttons - only for shelters and veterinarians */}
            {(user.role === 'shelter' || user.role === 'veterinarian') && (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleMyAnimals}
                >
                  <Heart className="mr-3 h-4 w-4" />
                  My Animals
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleAddAnimal}
                >
                  <PlusCircle className="mr-3 h-4 w-4" />
                  Add Animal
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push('/reports/unhandled')}
                >
                  <AlertTriangle className="mr-3 h-4 w-4" />
                  Unhandled Reports
                </Button>
              </>
            )}

            <hr className="my-4" />
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Disconnect
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
