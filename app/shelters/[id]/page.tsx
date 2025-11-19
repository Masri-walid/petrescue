"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { NavigationHeader } from '@/components/navigation-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  PawPrint,
  Star,
  Users,
  Heart,
  Shield,
  Camera,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { getProfileImageUrl } from '@/lib/profile-image-utils'

interface Organization {
  id: string
  name: string
  organizationType: string
  description?: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
  website?: string
  licenseNumber?: string
  capacity?: number
  currentAnimalCount: number
  rating?: number
  reviewCount?: number
  isVerified: boolean
  organizationHours?: Array<{
    dayOfWeek: string
    openTime: string
    closeTime: string
    isClosed: boolean
  }>
  organizationServices?: Array<{
    serviceName: string
    description?: string
  }>
}

export default function OrganizationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isUser = searchParams.get('user') === 'true'

  const [organization, setOrganization] = useState<Organization | null>(null)
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userPhotos, setUserPhotos] = useState<any[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null)
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)

  const organizationId = params.id as string

  useEffect(() => {
    if (!organizationId) return

    if (isUser) {
      fetchUser()
    } else {
      fetchOrganization()
      fetchOrganizationPhotos()
    }
  }, [organizationId, isUser])

  const fetchOrganization = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.request(`/organizations/${organizationId}`)

      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        setOrganization(response.data)
      } else {
        setError('Organization not found')
      }
    } catch (err) {
      console.error('Error fetching organization:', err)
      setError('Failed to load organization details')
    } finally {
      setLoading(false)
    }
  }

  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use the public users-by-type endpoint (which also returns photos)
      // and then find the specific user by id
      const response = await apiClient.request('/auth/users/by-type', {
        method: 'GET',
      })

      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        const users = response.data as any[]
        const foundUser = users.find((u) => u.id === organizationId)

        if (foundUser) {
          setUser(foundUser)
          setUserPhotos(foundUser.userPhotos || [])
        } else {
          setError('User not found')
        }
      } else {
        setError('User not found')
      }
    } catch (err) {
      console.error('Error fetching user:', err)
      setError('Failed to load provider details')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrganizationPhotos = async () => {
    try {
      const response = await apiClient.getUserPhotos(organizationId)
      if (response.data) {
        setUserPhotos(response.data)
      }
    } catch (err) {
      console.error('Error fetching organization photos:', err)
    }
  }

  const getOrganizationTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'shelter': return 'Animal Shelter'
      case 'rescue': return 'Animal Rescue'
      case 'veterinary_clinic': return 'Veterinary Clinic'
      case 'sanctuary': return 'Animal Sanctuary'
      default: return type
    }
  }

  const getOrganizationTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'shelter': return <Heart className="w-5 h-5" />
      case 'rescue': return <PawPrint className="w-5 h-5" />
      case 'veterinary_clinic': return <Shield className="w-5 h-5" />
      case 'sanctuary': return <Users className="w-5 h-5" />
      default: return <PawPrint className="w-5 h-5" />
    }
  }

  if (loading) {
    const loadingText = isUser ? 'Loading provider details...' : 'Loading organization details...'

    return (
      <>
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">{loadingText}</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error || (!isUser && !organization) || (isUser && !user)) {
    const notFoundTitle = isUser ? 'Provider Not Found' : 'Organization Not Found'
    const notFoundMessage = error || `The requested ${isUser ? 'provider' : 'organization'} could not be found.`

    return (
      <>
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{notFoundTitle}</h1>
            <p className="text-muted-foreground mb-4">{notFoundMessage}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </>
    )
  }

  // If this is a vet/shelter user, render their details instead of organization details
  if (isUser && user) {
    const fullName = `${user.firstName} ${user.lastName}`
    const typeLabel = user.userType === 'veterinarian' ? 'Veterinarian' : 'Shelter Provider'

    return (
      <>
        <NavigationHeader />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            {/* Back Button */}
            <div className="mb-6">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shelters
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Provider Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          {user.userType === 'veterinarian' ? (
                            <Shield className="w-5 h-5" />
                          ) : (
                            <Heart className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-2xl">{fullName}</CardTitle>
                            {user.isVerified && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <Shield className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="text-lg">{typeLabel}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Photo Gallery */}
                {userPhotos && userPhotos.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        Photo Gallery
                      </CardTitle>
                      <CardDescription>Photos shared by this provider</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {userPhotos.map((photo) => (
                          <div
                            key={photo.id}
                            className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
                            onClick={() => {
                              setSelectedPhoto(photo)
                              setIsPhotoModalOpen(true)
                            }}
                          >
                            <img
                              src={getProfileImageUrl(photo.photoUrl) || photo.photoUrl}
                              alt={photo.caption || 'Provider photo'}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                            {photo.caption && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
                                {photo.caption}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {user.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Address</p>
                          <p className="text-sm text-muted-foreground">
                            {user.address}
                            <br />
                            {user.city}, {user.state} {user.zipCode}
                          </p>
                        </div>
                      </div>
                    )}

                    {user.phone && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Phone</p>
                            <a
                              href={`tel:${user.phone}`}
                              className="text-sm text-primary hover:underline"
                            >
                              {user.phone}
                            </a>
                          </div>
                        </div>
                      </>
                    )}

                    {user.email && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Email</p>
                            <a
                              href={`mailto:${user.email}`}
                              className="text-sm text-primary hover:underline"
                            >
                              {user.email}
                            </a>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    <Heart className="w-4 h-4 mr-2" />
                    View Available Animals
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>

        {isPhotoModalOpen && selectedPhoto && (
          <div
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
            onClick={() => {
              setIsPhotoModalOpen(false)
              setSelectedPhoto(null)
            }}
          >
            <div
              className="bg-background max-w-5xl w-full mx-4 max-h-[90vh] rounded-lg overflow-hidden shadow-xl flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex-1 bg-black">
                <img
                  src={getProfileImageUrl(selectedPhoto.photoUrl) || selectedPhoto.photoUrl}
                  alt={selectedPhoto.caption || 'Photo'}
                  className="w-full h-full object-contain bg-black"
                />
              </div>
              <div className="w-full md:w-80 p-4 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">Photo details</h3>
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setIsPhotoModalOpen(false)
                      setSelectedPhoto(null)
                    }}
                  >
                    Close
                  </button>
                </div>
                {selectedPhoto.caption && (
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {selectedPhoto.caption}
                  </p>
                )}
                {selectedPhoto.createdAt && (
                  <p className="text-xs text-muted-foreground mt-auto">
                    Shared on {new Date(selectedPhoto.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }


  return (
    <>
      <NavigationHeader />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shelters
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Organization Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        {getOrganizationTypeIcon(organization.organizationType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-2xl">{organization.name}</CardTitle>
                          {organization.isVerified && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-lg">
                          {getOrganizationTypeLabel(organization.organizationType)}
                        </CardDescription>
                        {organization.rating && (
                          <div className="flex items-center gap-1 mt-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(organization.rating!)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {organization.rating} ({organization.reviewCount} reviews)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {organization.description && (
                  <CardContent>
                    <p className="text-muted-foreground">{organization.description}</p>
                  </CardContent>
                )}
              </Card>

              {/* Photo Gallery */}
              {userPhotos && userPhotos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      Photo Gallery
                    </CardTitle>
                    <CardDescription>Photos shared by this organization</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {userPhotos.map((photo) => (
                        <div
                          key={photo.id}
                          className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
                          onClick={() => {
                            setSelectedPhoto(photo)
                            setIsPhotoModalOpen(true)
                          }}
                        >
                          <img
                            src={getProfileImageUrl(photo.photoUrl) || photo.photoUrl}
                            alt={photo.caption || 'Organization photo'}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                          {photo.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
                              {photo.caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Services */}
              {organization.organizationServices && organization.organizationServices.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Services Offered</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {organization.organizationServices.map((service, index) => (
                        <div key={index} className="p-3 bg-muted/50 rounded-lg">
                          <h4 className="font-medium">{service.serviceName}</h4>
                          {service.description && (
                            <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Hours */}
              {organization.organizationHours && organization.organizationHours.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Hours of Operation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {organization.organizationHours.map((hour, index) => (
                        <div key={index} className="flex justify-between items-center py-2">
                          <span className="font-medium">{hour.dayOfWeek}</span>
                          <span className="text-muted-foreground">
                            {hour.isClosed ? 'Closed' : `${hour.openTime} - ${hour.closeTime}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">
                        {organization.address}<br />
                        {organization.city}, {organization.state} {organization.zipCode}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a
                        href={`tel:${organization.phone}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {organization.phone}
                      </a>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a
                        href={`mailto:${organization.email}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {organization.email}
                      </a>
                    </div>
                  </div>

                  {organization.website && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Website</p>
                          <a
                            href={organization.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Capacity Information */}
              {organization.capacity && (
                <Card>
                  <CardHeader>
                    <CardTitle>Capacity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                      <PawPrint className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Current Animals</p>
                        <p className="text-sm text-muted-foreground">
                          {organization.currentAnimalCount} of {organization.capacity} capacity
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((organization.currentAnimalCount / organization.capacity) * 100, 100)}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {Math.round((organization.currentAnimalCount / organization.capacity) * 100)}% capacity
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* License Information */}
              {organization.licenseNumber && (
                <Card>
                  <CardHeader>
                    <CardTitle>License Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">License Number</p>
                        <p className="text-sm text-muted-foreground">{organization.licenseNumber}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button className="w-full" size="lg">
                  <Heart className="w-4 h-4 mr-2" />
                  View Available Animals
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
              </div>
            </div>
          </div>
        </div>

      {isPhotoModalOpen && selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
          onClick={() => {
            setIsPhotoModalOpen(false)
            setSelectedPhoto(null)
          }}
        >
          <div
            className="bg-background max-w-5xl w-full mx-4 max-h-[90vh] rounded-lg overflow-hidden shadow-xl flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex-1 bg-black">
              <img
                src={getProfileImageUrl(selectedPhoto.photoUrl) || selectedPhoto.photoUrl}
                alt={selectedPhoto.caption || 'Photo'}
                className="w-full h-full object-contain bg-black"
              />
            </div>
            <div className="w-full md:w-80 p-4 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg">Photo details</h3>
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setIsPhotoModalOpen(false)
                    setSelectedPhoto(null)
                  }}
                >
                  Close
                </button>
              </div>
              {selectedPhoto.caption && (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {selectedPhoto.caption}
                </p>
              )}
              {selectedPhoto.createdAt && (
                <p className="text-xs text-muted-foreground mt-auto">
                  Shared on {new Date(selectedPhoto.createdAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      </div>
    </>
  )
}
