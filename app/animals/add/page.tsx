"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Heart, PlusCircle, Upload, ArrowLeft, Camera, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRef } from 'react'

export default function AddAnimalPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    ageCategory: '',
    estimatedAge: '',
    gender: '',
    size: '',
    color: '',
    weight: '',
    description: '',
    adoptionFee: '',
    healthStatus: 'Unknown',
    vaccinated: false,
    spayedNeutered: false,
    microchipped: false,
    goodWithKids: false,
    goodWithPets: false,
    goodWithCats: false,
    houseTrained: false,
    specialNeeds: false,
    energyLevel: '',
    personality: '',
    availableFor: 'adoption' // adoption, sale, both
  })

  const [photos, setPhotos] = useState<File[]>([])
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
            Only shelters and veterinarians can add animals to the system.
          </p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (photos.length + files.length > 5) {
      alert("Maximum 5 photos allowed")
      return
    }

    for (const file of files.slice(0, 5 - photos.length)) {
      setPhotos((prev) => [...prev, file])
    }
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      setStream(mediaStream)
      setShowCamera(true)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Unable to access camera. Please use file upload instead.")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (context) {
        context.drawImage(video, 0, 0)
        canvas.toBlob(
          async (blob) => {
            if (blob && photos.length < 5) {
              const file = new File([blob], `animal-photo-${Date.now()}.jpg`, { type: "image/jpeg" })
              setPhotos((prev) => [...prev, file])
            }
          },
          "image/jpeg",
          0.8,
        )
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      // Prepare animal data to match API expectations
      const animalData = {
        name: formData.name.trim(),
        type: formData.species, // API expects 'type' not 'species'
        breed: formData.breed.trim() || null,
        ageCategory: formData.ageCategory || null,
        estimatedAge: formData.estimatedAge ? parseInt(formData.estimatedAge) : null,
        gender: formData.gender || null,
        size: formData.size || null,
        color: formData.color.trim() || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        description: formData.description.trim() || null,
        adoptionFee: formData.adoptionFee ? parseFloat(formData.adoptionFee) : 0,
        healthStatus: formData.healthStatus,
        vaccinated: formData.vaccinated,
        spayedNeutered: formData.spayedNeutered,
        microchipped: formData.microchipped,
        goodWithKids: formData.goodWithKids,
        goodWithPets: formData.goodWithPets,
        goodWithCats: formData.goodWithCats,
        houseTrained: formData.houseTrained,
        specialNeeds: formData.specialNeeds,
        energyLevel: formData.energyLevel || null,
        personality: formData.personality.trim() ? formData.personality.trim().split(',').map(p => p.trim()) : [],
        status: 'Available',
        featured: false
      }

      console.log('Submitting animal data:', animalData)

      // Create FormData for multipart upload
      const formDataToSend = new FormData()

      // Add all animal data as JSON
      Object.entries(animalData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            formDataToSend.append(key, JSON.stringify(value))
          } else {
            formDataToSend.append(key, value.toString())
          }
        }
      })

      // Add photos
      photos.forEach((photo, index) => {
        formDataToSend.append(`photos`, photo)
      })

      // Use API client for submission
      let response;
      if (photos.length > 0) {
        // Submit with photos using FormData
        response = await apiClient.request('/animals/with-photos', {
          method: 'POST',
          body: formDataToSend
        })
      } else {
        // Submit without photos using JSON
        response = await apiClient.request('/animals', {
          method: 'POST',
          body: JSON.stringify(animalData)
        })
      }

      if (response.error) {
        setError(response.error)
      } else {
        setSuccess('Animal added successfully!')
        // Clear form
        setFormData({
          name: '',
          species: '',
          breed: '',
          ageCategory: '',
          estimatedAge: '',
          gender: '',
          size: '',
          color: '',
          weight: '',
          description: '',
          adoptionFee: '',
          healthStatus: 'Unknown',
          vaccinated: false,
          spayedNeutered: false,
          microchipped: false,
          goodWithKids: false,
          goodWithPets: false,
          goodWithCats: false,
          houseTrained: false,
          specialNeeds: false,
          energyLevel: '',
          personality: '',
          availableFor: 'adoption'
        })
        setPhotos([])
        // Redirect to animals list after a short delay
        setTimeout(() => {
          router.push('/profile/animals')
        }, 2000)
      }


    } catch (error) {
      console.error('Error adding animal:', error)
      setError('Failed to add animal. Please try again.')
    }

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">PetRescue Connect</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold">Add New Animal</h1>
          <p className="text-muted-foreground">
            Add an animal to make it available for adoption or sale
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Success/Error Messages */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-100 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              )}

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Essential details about the animal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        placeholder="Animal's name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="species">Species *</Label>
                      <Select
                        value={formData.species}
                        onValueChange={(value) => handleInputChange('species', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select species" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dog">Dog</SelectItem>
                          <SelectItem value="cat">Cat</SelectItem>
                          <SelectItem value="rabbit">Rabbit</SelectItem>
                          <SelectItem value="bird">Bird</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="breed">Breed</Label>
                      <Input
                        id="breed"
                        placeholder="e.g., Golden Retriever"
                        value={formData.breed}
                        onChange={(e) => handleInputChange('breed', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => handleInputChange('gender', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="size">Size</Label>
                      <Select
                        value={formData.size}
                        onValueChange={(value) => handleInputChange('size', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                          <SelectItem value="extra_large">Extra Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ageCategory">Age Category</Label>
                      <Select
                        value={formData.ageCategory}
                        onValueChange={(value) => handleInputChange('ageCategory', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select age category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="puppy">Puppy</SelectItem>
                          <SelectItem value="kitten">Kitten</SelectItem>
                          <SelectItem value="young">Young</SelectItem>
                          <SelectItem value="adult">Adult</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estimatedAge">Age (months)</Label>
                      <Input
                        id="estimatedAge"
                        type="number"
                        placeholder="Age in months"
                        value={formData.estimatedAge}
                        onChange={(e) => handleInputChange('estimatedAge', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        placeholder="Weight in kg"
                        value={formData.weight}
                        onChange={(e) => handleInputChange('weight', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Color/Markings</Label>
                    <Input
                      id="color"
                      placeholder="e.g., Brown and white, Black with white chest"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Description & Personality */}
              <Card>
                <CardHeader>
                  <CardTitle>Description & Personality</CardTitle>
                  <CardDescription>Tell potential adopters about this animal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the animal's appearance, behavior, and any special notes..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="personality">Personality Traits</Label>
                    <Input
                      id="personality"
                      placeholder="e.g., Friendly, Energetic, Calm, Playful"
                      value={formData.personality}
                      onChange={(e) => handleInputChange('personality', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="energyLevel">Energy Level</Label>
                    <Select
                      value={formData.energyLevel}
                      onValueChange={(value) => handleInputChange('energyLevel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select energy level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="very_high">Very High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Photos */}
              <Card>
                <CardHeader>
                  <CardTitle>Photos</CardTitle>
                  <CardDescription>Add up to 5 photos to help potential adopters see your animal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Take photos or upload up to 5 photos of the animal</p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button type="button" variant="outline" onClick={startCamera}>
                        <Camera className="w-4 h-4 mr-2" />
                        Take Photo
                      </Button>
                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photos
                      </Button>
                    </div>
                  </div>

                  {showCamera && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                      <div className="bg-background rounded-lg p-4 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">Take Photo</h3>
                          <Button variant="ghost" size="sm" onClick={stopCamera}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="relative">
                          <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
                          <canvas ref={canvasRef} className="hidden" />
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button onClick={capturePhoto} className="flex-1">
                            <Camera className="w-4 h-4 mr-2" />
                            Capture
                          </Button>
                          <Button variant="outline" onClick={stopCamera}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                            <Image
                              src={URL.createObjectURL(photo) || "/placeholder.svg"}
                              alt={`Photo ${index + 1}`}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removePhoto(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <PlusCircle className="w-4 h-4 mr-2 animate-spin" />
                    Adding Animal...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Animal
                  </>
                )}
              </Button>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Availability */}
              <Card>
                <CardHeader>
                  <CardTitle>Availability</CardTitle>
                  <CardDescription>How is this animal available?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="availableFor">Available For</Label>
                    <Select
                      value={formData.availableFor}
                      onValueChange={(value) => handleInputChange('availableFor', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adoption">Adoption</SelectItem>
                        <SelectItem value="sale">Sale</SelectItem>
                        <SelectItem value="both">Both Adoption & Sale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adoptionFee">Fee ($)</Label>
                    <Input
                      id="adoptionFee"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.adoptionFee}
                      onChange={(e) => handleInputChange('adoptionFee', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave as 0 for free adoption
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Health Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Health & Care</CardTitle>
                  <CardDescription>Medical and care information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="healthStatus">Health Status</Label>
                    <Select
                      value={formData.healthStatus}
                      onValueChange={(value) => handleInputChange('healthStatus', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select health status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Fair">Fair</SelectItem>
                        <SelectItem value="Poor">Poor</SelectItem>
                        <SelectItem value="Unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="vaccinated"
                        checked={formData.vaccinated}
                        onCheckedChange={(checked) => handleInputChange('vaccinated', checked as boolean)}
                      />
                      <Label htmlFor="vaccinated">Vaccinated</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="spayedNeutered"
                        checked={formData.spayedNeutered}
                        onCheckedChange={(checked) => handleInputChange('spayedNeutered', checked as boolean)}
                      />
                      <Label htmlFor="spayedNeutered">Spayed/Neutered</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="microchipped"
                        checked={formData.microchipped}
                        onCheckedChange={(checked) => handleInputChange('microchipped', checked as boolean)}
                      />
                      <Label htmlFor="microchipped">Microchipped</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="specialNeeds"
                        checked={formData.specialNeeds}
                        onCheckedChange={(checked) => handleInputChange('specialNeeds', checked as boolean)}
                      />
                      <Label htmlFor="specialNeeds">Special Needs</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Behavior */}
              <Card>
                <CardHeader>
                  <CardTitle>Behavior</CardTitle>
                  <CardDescription>Social compatibility</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="goodWithKids"
                      checked={formData.goodWithKids}
                      onCheckedChange={(checked) => handleInputChange('goodWithKids', checked as boolean)}
                    />
                    <Label htmlFor="goodWithKids">Good with Kids</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="goodWithPets"
                      checked={formData.goodWithPets}
                      onCheckedChange={(checked) => handleInputChange('goodWithPets', checked as boolean)}
                    />
                    <Label htmlFor="goodWithPets">Good with Other Pets</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="goodWithCats"
                      checked={formData.goodWithCats}
                      onCheckedChange={(checked) => handleInputChange('goodWithCats', checked as boolean)}
                    />
                    <Label htmlFor="goodWithCats">Good with Cats</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="houseTrained"
                      checked={formData.houseTrained}
                      onCheckedChange={(checked) => handleInputChange('houseTrained', checked as boolean)}
                    />
                    <Label htmlFor="houseTrained">House Trained</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
