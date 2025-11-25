"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { getProfileImageUrl } from '@/lib/profile-image-utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, PlusCircle, ArrowLeft, Eye, Edit, Trash2, Upload, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { NavigationHeader } from '@/components/navigation-header'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function MyAnimalsPage() {
  const { user, isAuthenticated } = useAuth()
  const [animals, setAnimals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingAnimal, setEditingAnimal] = useState<any | null>(null)
  const [deletingAnimalId, setDeletingAnimalId] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newPhotos, setNewPhotos] = useState<File[]>([])
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<string[]>([])

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

  const handleEditClick = (animal: any) => {
    setEditingAnimal({ ...animal })
    setNewPhotos([])
    setDeletedPhotoIds([])
    setIsEditDialogOpen(true)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setNewPhotos(prev => [...prev, ...files])
  }

  const handleRemoveNewPhoto = (index: number) => {
    setNewPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleDeleteExistingPhoto = (photoId: string) => {
    setDeletedPhotoIds(prev => [...prev, photoId])
  }

  const handleDeleteClick = (animalId: string) => {
    setDeletingAnimalId(animalId)
    setIsDeleteDialogOpen(true)
  }

  const handleEditSave = async () => {
    if (!editingAnimal) return

    try {
      setIsSaving(true)

      // First, update the animal information
      const response = await apiClient.updateAnimal(editingAnimal.id, {
        name: editingAnimal.name,
        breed: editingAnimal.breed,
        ageCategory: editingAnimal.ageCategory,
        estimatedAge: editingAnimal.estimatedAge,
        gender: editingAnimal.gender,
        size: editingAnimal.size,
        color: editingAnimal.color,
        weight: editingAnimal.weight,
        description: editingAnimal.description,
        status: editingAnimal.status,
        adoptionFee: editingAnimal.adoptionFee,
        isFeatured: editingAnimal.isFeatured,
        specialNeeds: editingAnimal.specialNeeds,
        microchipId: editingAnimal.microchipId,
        isSpayedNeutered: editingAnimal.isSpayedNeutered,
        vaccinationStatus: editingAnimal.vaccinationStatus,
      })

      if (response.error) {
        setError(response.error)
        setIsSaving(false)
        return
      }

      // Delete photos marked for deletion
      for (const photoId of deletedPhotoIds) {
        await apiClient.deleteAnimalPhoto(photoId)
      }

      // Upload new photos
      for (let i = 0; i < newPhotos.length; i++) {
        const photo = newPhotos[i]
        const existingPhotosCount = (editingAnimal.animalPhotos?.length || 0) - deletedPhotoIds.length
        await apiClient.uploadAnimalPhoto(
          photo,
          editingAnimal.id,
          photo.name,
          existingPhotosCount === 0 && i === 0, // Set first photo as primary if no existing photos
          existingPhotosCount + i
        )
      }

      // Refresh the animal data to get updated photos
      const updatedAnimalResponse = await apiClient.getAnimal(editingAnimal.id)
      if (updatedAnimalResponse.data) {
        setAnimals(animals.map(a => a.id === editingAnimal.id ? updatedAnimalResponse.data : a))
      } else {
        setAnimals(animals.map(a => a.id === editingAnimal.id ? response.data : a))
      }

      setIsEditDialogOpen(false)
      setEditingAnimal(null)
      setNewPhotos([])
      setDeletedPhotoIds([])
    } catch (err) {
      console.error('Error updating animal:', err)
      setError('Failed to update animal')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingAnimalId) return

    try {
      setIsSaving(true)
      const response = await apiClient.deleteAnimal(deletingAnimalId)

      if (response.error) {
        setError(response.error)
      } else {
        // Remove the animal from the list
        setAnimals(animals.filter(a => a.id !== deletingAnimalId))
        setIsDeleteDialogOpen(false)
        setDeletingAnimalId(null)
      }
    } catch (err) {
      console.error('Error deleting animal:', err)
      setError('Failed to delete animal')
    } finally {
      setIsSaving(false)
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
                      : (getProfileImageUrl(rawPhotoUrl) || "/placeholder.svg"))
                  : "/placeholder.svg"

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
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-muted-foreground">
                        {animal.species} • {animal.gender}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/adopt/${animal.id}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditClick(animal)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteClick(animal.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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

      {/* Edit Animal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Animal</DialogTitle>
            <DialogDescription>
              Update the information for {editingAnimal?.name}
            </DialogDescription>
          </DialogHeader>

          {editingAnimal && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editingAnimal.name || ''}
                    onChange={(e) => setEditingAnimal({ ...editingAnimal, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    value={editingAnimal.breed || ''}
                    onChange={(e) => setEditingAnimal({ ...editingAnimal, breed: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ageCategory">Age Category</Label>
                  <Select
                    value={editingAnimal.ageCategory || ''}
                    onValueChange={(value) => setEditingAnimal({ ...editingAnimal, ageCategory: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select age category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baby">Baby</SelectItem>
                      <SelectItem value="Young">Young</SelectItem>
                      <SelectItem value="Adult">Adult</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={editingAnimal.gender || ''}
                    onValueChange={(value) => setEditingAnimal({ ...editingAnimal, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <Select
                    value={editingAnimal.size || ''}
                    onValueChange={(value) => setEditingAnimal({ ...editingAnimal, size: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Small">Small</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Large">Large</SelectItem>
                      <SelectItem value="Extra Large">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={editingAnimal.color || ''}
                    onChange={(e) => setEditingAnimal({ ...editingAnimal, color: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={editingAnimal.weight || ''}
                    onChange={(e) => setEditingAnimal({ ...editingAnimal, weight: parseFloat(e.target.value) || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adoptionFee">Adoption Fee ($)</Label>
                  <Input
                    id="adoptionFee"
                    type="number"
                    value={editingAnimal.adoptionFee || ''}
                    onChange={(e) => setEditingAnimal({ ...editingAnimal, adoptionFee: parseFloat(e.target.value) || null })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editingAnimal.status || 'Available'}
                  onValueChange={(value) => setEditingAnimal({ ...editingAnimal, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Adopted">Adopted</SelectItem>
                    <SelectItem value="Unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingAnimal.description || ''}
                  onChange={(e) => setEditingAnimal({ ...editingAnimal, description: e.target.value })}
                  rows={4}
                />
              </div>

              {/* Photo Management */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label>Photos</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Add Photos
                  </Button>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                {/* Existing Photos */}
                {editingAnimal.animalPhotos && editingAnimal.animalPhotos.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Current Photos</p>
                    <div className="grid grid-cols-3 gap-2">
                      {editingAnimal.animalPhotos
                        .filter((photo: any) => !deletedPhotoIds.includes(photo.id))
                        .map((photo: any) => {
                          const rawPhotoUrl = photo.photoUrl || photo.filePath
                          const photoUrl = rawPhotoUrl?.startsWith('data:')
                            ? rawPhotoUrl
                            : (getProfileImageUrl(rawPhotoUrl) || getProfileImageUrl(`/api/images/animal-photo/${photo.id}`))

                          return (
                            <div key={photo.id} className="relative group">
                              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                                <Image
                                  src={photoUrl || '/placeholder.svg'}
                                  alt={photo.caption || 'Animal photo'}
                                  width={100}
                                  height={100}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDeleteExistingPhoto(photo.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                              {photo.isPrimary && (
                                <Badge className="absolute bottom-1 left-1 text-xs">Primary</Badge>
                              )}
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}

                {/* New Photos to Upload */}
                {newPhotos.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">New Photos to Upload</p>
                    <div className="grid grid-cols-3 gap-2">
                      {newPhotos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={`New photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveNewPhoto(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Badge className="absolute bottom-1 left-1 text-xs bg-green-500">New</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setEditingAnimal(null)
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the animal
              from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isSaving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSaving ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
