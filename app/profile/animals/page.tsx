"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { getProfileImageUrl } from '@/lib/profile-image-utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, PlusCircle, ArrowLeft, Eye, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { NavigationHeader } from '@/components/navigation-header'

export default function MyAnimalsPage() {
  const { user, isAuthenticated } = useAuth()
  const [animals, setAnimals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch animals for the current user/organization
  useEffect(() => {
    const fetchAnimals = async () => {
      if (!user?.organizationId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await apiClient.getAnimals({
          organizationId: user.organizationId,
          pageSize: 50
        })

        if (response.error) {
          setError(response.error)
        } else if (response.data) {
          setAnimals(response.data.animals || [])
        }
      } catch (err) {
        console.error('Error fetching animals:', err)
        setError('Failed to load animals')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && user) {
      fetchAnimals()
    }
  }, [user, isAuthenticated])

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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'adopted':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'unavailable':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your animals...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />

      <div className="container mx-auto max-w-6xl py-8 px-4">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Animals</h1>
              <p className="text-muted-foreground">
                Manage animals you've added for adoption or sale ({animals.length} total)
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

        {/* Error State */}
        {error && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                <p>{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Animals List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {animals.length === 0 ? (
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
          ) : (
            animals.map((animal) => {
              // Check both possible photo array names and photo URL properties
              const photos = animal.animalPhotos || animal.photos || []
              const primaryPhoto = photos.find((p: any) => p.isPrimary) || photos[0]
              const rawPhotoUrl = primaryPhoto?.photoUrl || primaryPhoto?.filePath
              const displayPhotoUrl =
                rawPhotoUrl
                  ? (rawPhotoUrl.startsWith('data:')
                      ? rawPhotoUrl
                      : (getProfileImageUrl(rawPhotoUrl) || "/a-cute-pet.png"))
                  : "/a-cute-pet.png"

              return (
                <Card key={animal.id} className="overflow-hidden">
                  <div className="aspect-[4/3] relative">
                    <Image
                      src={displayPhotoUrl}
                      alt={animal.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={getStatusColor(animal.status)}>
                        {animal.status || 'Available'}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{animal.name}</CardTitle>
                        <CardDescription>
                          {animal.breed} • {animal.age || 'Unknown age'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {animal.species} • {animal.gender}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/adopt/${animal.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
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
