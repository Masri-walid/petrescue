"use client"

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { UserProfileMenu } from './user-profile-menu'
import { UserProfileHybrid } from './user-profile-hybrid'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'

export function NavigationHeader() {
  const { isAuthenticated, isLoading, user } = useAuth()

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <Link href="/" className="text-xl font-bold text-foreground hover:text-primary transition-colors">
              PetRescue Connect
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/rescue" className="text-muted-foreground hover:text-foreground transition-colors">
              Report Rescue
            </Link>
            <Link href="/adopt" className="text-muted-foreground hover:text-foreground transition-colors">
              Adopt
            </Link>
            <Link href="/find-my-pet" className="text-muted-foreground hover:text-foreground transition-colors">
              Find My Pet
            </Link>
            <Link href="/shelters" className="text-muted-foreground hover:text-foreground transition-colors">
              Shelters
            </Link>

            {/* Role-based navigation */}
            {user && (user.role === 'veterinarian' || user.role === 'shelter') ? (
              <>
                {/* Vets and Shelters see Notifications instead of Rescue Dashboard */}
                <Link href="/profile/animals" className="text-muted-foreground hover:text-foreground transition-colors">
                  My Animals
                </Link>
                <Link href="/notifications" className="text-muted-foreground hover:text-foreground transition-colors">
                  Notifications
                </Link>
                <Link href="/adoption-applications" className="text-muted-foreground hover:text-foreground transition-colors">
                  Applications
                </Link>
              </>
            ) : (
              <>
                {/* Normal users see Rescue Dashboard */}
                <Link href="/rescue-dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Rescue Reports
                </Link>
              </>
            )}

            {/* Authentication-based navigation */}
            {isLoading ? (
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-2">
                <UserProfileHybrid />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
                <Button asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile menu - simplified for now */}
          <div className="md:hidden">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-2">
                <UserProfileHybrid />
              </div>
            ) : (
              <Button asChild size="sm">
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
