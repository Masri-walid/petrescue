"use client"

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { getProfileImageUrl, getUserInitials } from '@/lib/profile-image-utils'
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

export function DebugProfileMenu() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')

  if (!user) {
    return (
      <div className="p-2 bg-red-100 text-red-800 rounded">
        No user data available
      </div>
    )
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const handleDebugClick = () => {
    setDebugInfo(JSON.stringify(user, null, 2))
    console.log('User data:', user)
    console.log('Dropdown open state:', isOpen)
  }

  return (
    <div className="relative">
      {/* Debug info */}
      <div className="fixed top-20 right-4 bg-black text-white p-2 text-xs max-w-xs z-[9999]">
        <div>User: {user.firstName} {user.lastName}</div>
        <div>Email: {user.email}</div>
        <div>Role: {user.role}</div>
        <div>Dropdown Open: {isOpen ? 'Yes' : 'No'}</div>
        <button 
          onClick={handleDebugClick}
          className="bg-blue-500 text-white px-2 py-1 mt-2 text-xs"
        >
          Debug
        </button>
      </div>

      {/* Original dropdown */}
      <DropdownMenu onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="relative h-10 w-10 rounded-full border-2 border-blue-500"
            onClick={() => console.log('Avatar clicked!')}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={getProfileImageUrl(user.profileImageUrl)} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getUserInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-64 bg-white border border-gray-300 shadow-lg" 
          align="end" 
          forceMount
          style={{ zIndex: 9999 }}
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-medium leading-none">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                Role: {user.role}
              </p>
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

      {/* Alternative simple dropdown for testing */}
      <div className="ml-4">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-green-500 text-white px-3 py-1 rounded"
        >
          Simple Toggle
        </button>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-[9999]">
            <div className="p-2">
              <div className="font-medium">{user.firstName} {user.lastName}</div>
              <div className="text-sm text-gray-600">{user.email}</div>
              <hr className="my-2" />
              <button 
                onClick={handleProfileEdit}
                className="block w-full text-left px-2 py-1 hover:bg-gray-100"
              >
                Edit Profile
              </button>
              <button 
                onClick={handleMyReports}
                className="block w-full text-left px-2 py-1 hover:bg-gray-100"
              >
                My Reports
              </button>
              <hr className="my-2" />
              <button 
                onClick={handleLogout}
                className="block w-full text-left px-2 py-1 hover:bg-gray-100 text-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {debugInfo && (
        <pre className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 text-xs max-w-md overflow-auto z-[9999]">
          {debugInfo}
        </pre>
      )}
    </div>
  )
}
