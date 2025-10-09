"use client"

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, PlusCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function MyAnimalsPage() {
  const { user, isAuthenticated } = useAuth()

  // Check if user is authorized
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You need to be logged in to access this page.</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (user.role !== 'shelter' && user.role !== 'veterinarian') {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            Only shelters and veterinarians can manage animals.
          </p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/profile">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">PetRescue Connect</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Animals</h1>
              <p className="text-muted-foreground">
                Manage animals you've added for adoption or sale
              </p>
            </div>
            <Link href="/animals/add">
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Animal
              </Button>
            </Link>
          </div>
        </div>

        {/* Animals List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder for when no animals are added yet */}
          <Card className="col-span-full">
            <CardHeader className="text-center">
              <CardTitle>No Animals Added Yet</CardTitle>
              <CardDescription>
                You haven't added any animals to the system yet. Click "Add Animal" to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/animals/add">
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Your First Animal
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>Managing animals on PetRescue Connect</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <PlusCircle className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">1. Add Animals</h3>
                  <p className="text-sm text-muted-foreground">
                    Add detailed information about animals available for adoption or sale
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">2. Get Discovered</h3>
                  <p className="text-sm text-muted-foreground">
                    Your animals appear in search results for potential adopters
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <div className="w-6 h-6 bg-primary rounded-full" />
                  </div>
                  <h3 className="font-semibold mb-2">3. Connect</h3>
                  <p className="text-sm text-muted-foreground">
                    Interested adopters can contact you directly through the platform
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
