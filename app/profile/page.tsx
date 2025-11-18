"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { NavigationHeader } from '@/components/navigation-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Phone, MapPin, Settings, FileText, PlusCircle, AlertTriangle, Heart, Camera, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { apiClient } from '@/lib/api'

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  // Photo management state
  const [userPhotos, setUserPhotos] = useState<any[]>([])
  const [loadingPhotos, setLoadingPhotos] = useState(false)
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null)
  const [newPhotoPreview, setNewPhotoPreview] = useState('')
  const [newPhotoCaption, setNewPhotoCaption] = useState('')
  const [addingPhoto, setAddingPhoto] = useState(false)

  // Fetch user photos for shelters and vets
  useEffect(() => {
    const fetchUserPhotos = async () => {
      if (!isAuthenticated || !user || (user.role !== 'shelter' && user.role !== 'veterinarian')) {
        return
      }

      try {
        setLoadingPhotos(true)
        const response = await apiClient.getUserPhotos()
        if (response.data) {
          setUserPhotos(response.data)
        }
      } catch (error) {
        console.error('Error fetching user photos:', error)
      } finally {
        setLoadingPhotos(false)
      }
    }

    fetchUserPhotos()
  }, [isAuthenticated, user])

  const handleAddPhoto = async () => {
    if (!newPhotoFile) return

    try {
      setAddingPhoto(true)
      const response = await apiClient.uploadUserPhoto(
        newPhotoFile,
        newPhotoCaption || undefined,
        userPhotos.length === 0 // Make first photo primary
      )

      if (response.error) {
        alert(`Error uploading photo: ${response.error}`)
      } else if (response.data) {
        // Refresh user photos list
        const photosResponse = await apiClient.getUserPhotos()
        if (photosResponse.data) {
          setUserPhotos(photosResponse.data)
        }
        setNewPhotoFile(null)
        setNewPhotoPreview('')
        setNewPhotoCaption('')
      }
    } catch (error) {
      console.error('Error adding photo:', error)
      alert('Failed to upload photo. Please try again.')
    } finally {
      setAddingPhoto(false)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await apiClient.deleteUserPhoto(photoId)
      setUserPhotos(userPhotos.filter(photo => photo.id !== photoId))
    } catch (error) {
      console.error('Error deleting photo:', error)
    }
  }

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-4">You need to be logged in to access your profile.</p>
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'veterinarian':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'shelter':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'citizen':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'veterinarian':
        return '🩺'
      case 'shelter':
        return '🏠'
      case 'citizen':
        return '👤'
      default:
        return '👤'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">PetRescue Connect</span>
          </div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Profile Information
                    </CardTitle>
                    <CardDescription>Your personal details and contact information</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/profile/edit">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-lg">
                    {getRoleIcon(user.role)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{user.firstName} {user.lastName}</h3>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role === 'veterinarian' ? 'Veterinarian' : 
                       user.role === 'shelter' ? 'Shelter' : 'Citizen'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{user.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {(user.city || user.state) && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">
                          {user.city && user.state ? `${user.city}, ${user.state}` : user.city || user.state}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/profile/reports">
                    <FileText className="w-4 h-4 mr-2" />
                    My Reports
                  </Link>
                </Button>
                
                {(user.role === 'veterinarian' || user.role === 'shelter') && (
                  <>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/profile/animals">
                        <Heart className="w-4 h-4 mr-2" />
                        My Animals
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/animals/add">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Animal
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/reports/unhandled">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Unhandled Reports
                      </Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Photo Gallery for Shelters and Vets */}
            {(user.role === 'veterinarian' || user.role === 'shelter') && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Photo Gallery
                  </CardTitle>
                  <CardDescription>Showcase your facility and team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Photo Form */}
                  <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-2">
                      <Label htmlFor="photoFile">Upload Photo</Label>
                      <Input
                        id="photoFile"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setNewPhotoFile(file)
                            const reader = new FileReader()
                            reader.onload = (event) => {
                              const result = event.target?.result as string
                              setNewPhotoPreview(result)
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                    </div>
                    {newPhotoPreview && (
                      <div className="space-y-2">
                        <Label>Photo Preview</Label>
                        <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                          <Image
                            src={newPhotoPreview}
                            alt="Photo preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="photoCaption">Caption (optional)</Label>
                      <Input
                        id="photoCaption"
                        placeholder="Describe this photo..."
                        value={newPhotoCaption}
                        onChange={(e) => setNewPhotoCaption(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleAddPhoto}
                      disabled={!newPhotoFile || addingPhoto}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {addingPhoto ? 'Adding...' : 'Add Photo'}
                    </Button>
                  </div>

                  {/* Photo Grid */}
                  {loadingPhotos ? (
                    <div className="text-center py-4">Loading photos...</div>
                  ) : userPhotos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userPhotos.map((photo) => (
                        <div key={photo.id} className="relative group">
                          <div className="aspect-[4/3] relative overflow-hidden rounded-lg border shadow-sm">
                            <Image
                              src={photo.photoUrl}
                              alt={photo.caption || 'User photo'}
                              fill
                              className="object-cover hover:scale-105 transition-transform duration-300"
                            />
                            {photo.isPrimary && (
                              <Badge className="absolute top-2 left-2 text-xs bg-blue-500">Primary</Badge>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                              onClick={() => handleDeletePhoto(photo.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          {photo.caption && (
                            <div className="mt-2 p-2 bg-muted/50 rounded text-center">
                              <p className="text-sm text-muted-foreground">
                                {photo.caption}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No photos added yet</p>
                      <p className="text-sm">Add photos to showcase your facility</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
