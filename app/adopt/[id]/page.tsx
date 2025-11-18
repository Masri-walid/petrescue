"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, ArrowLeft, MapPin, Calendar, Phone, Mail, Share2, Star, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { apiClient } from "@/lib/api"



export default function PetDetailPage() {
  const params = useParams()
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [pet, setPet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPet = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getAnimal(params.id as string)

        if (response.error) {
          setError(response.error)
        } else {
          setPet(response.data)
        }
      } catch (err) {
        console.error('Error fetching pet:', err)
        setError('Failed to load pet details')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPet()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading pet details...</p>
        </div>
      </div>
    )
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Pet Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || 'The pet you are looking for could not be found.'}</p>
          <Link href="/adopt">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Adoption
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/adopt" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Adoption</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="bg-transparent">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <Card className="overflow-hidden">
              <div className="aspect-[4/3] relative">
                <Image
                  src={pet.animalPhotos?.[currentPhotoIndex]?.photoUrl || "/a-cute-pet.png"}
                  alt={`${pet.name} photo ${currentPhotoIndex + 1}`}
                  fill
                  className="object-cover"
                />
                {pet.isFeatured && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-yellow-500 text-yellow-900">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <Badge variant="default">Available</Badge>
                </div>
              </div>

              {pet.animalPhotos && pet.animalPhotos.length > 1 && (
                <div className="p-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {pet.animalPhotos.map((photo: any, index: number) => (
                      <button
                        key={photo.id}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          currentPhotoIndex === index ? "border-primary" : "border-transparent"
                        }`}
                      >
                        <Image
                          src={photo.photoUrl || "/a-cute-pet.png"}
                          alt={`${pet.name} thumbnail ${index + 1}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Pet Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl">{pet.name || 'Unnamed Pet'}</CardTitle>
                    <CardDescription className="text-lg">
                      {pet.breed} • {pet.ageCategory || `${pet.estimatedAge} years`} • {pet.gender}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">${pet.adoptionFee || 'Contact for info'}</div>
                    <div className="text-sm text-muted-foreground">Adoption Fee</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">{pet.description}</p>

                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="personality">Personality</TabsTrigger>
                    <TabsTrigger value="medical">Medical</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Basic Info</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Size:</span>
                            <span>{pet.size || 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Weight:</span>
                            <span>{pet.weight ? `${pet.weight} lbs` : 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Color:</span>
                            <span>{pet.color || 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Species:</span>
                            <span>{pet.species}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Health Status</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Spayed/Neutered:</span>
                            {pet.isSpayedNeutered ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Vaccination Status:</span>
                            <span>{pet.vaccinationStatus || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Microchip:</span>
                            <span>{pet.microchipId ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Special Needs:</span>
                            <span>{pet.specialNeeds || 'None'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="personality" className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3">Personality Traits</h4>
                      <div className="flex flex-wrap gap-2">
                        {pet.personalityTraits && pet.personalityTraits.length > 0 ? (
                          pet.personalityTraits.map((trait: string) => (
                            <Badge key={trait} variant="secondary">
                              {trait}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No personality traits listed</p>
                        )}
                      </div>
                    </div>


                  </TabsContent>

                  <TabsContent value="medical" className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3">Medical Status</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Vaccination Status:</span>
                          <span>{pet.vaccinationStatus || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Spayed/Neutered:</span>
                          {pet.isSpayedNeutered ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Microchipped:</span>
                          {pet.microchipId ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      {pet.medicalConditions && pet.medicalConditions.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-medium mb-2">Medical Conditions</h5>
                          <div className="flex flex-wrap gap-2">
                            {pet.medicalConditions.map((condition: string) => (
                              <Badge key={condition} variant="outline">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {pet.specialNeeds && (
                        <div>
                          <h5 className="font-medium mb-2">Special Needs</h5>
                          <p className="text-sm text-muted-foreground">{pet.specialNeeds}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Adoption Action */}
            <Card>
              <CardHeader>
                <CardTitle>Ready to Adopt?</CardTitle>
                <CardDescription>Start your adoption application today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" size="lg" onClick={() => setShowApplicationForm(true)}>
                  <Heart className="w-4 h-4 mr-2" />
                  Apply to Adopt {pet.name}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Have questions?</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location & Rescue Info */}
            <Card>
              <CardHeader>
                <CardTitle>Location & Rescue Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{pet.organization?.name || 'Unknown Organization'}</p>
                    <p className="text-sm text-muted-foreground">{pet.organization?.address || 'Address not available'}</p>
                    {pet.organization?.phone && (
                      <p className="text-sm text-muted-foreground">{pet.organization.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Added to System</p>
                    <p className="text-sm text-muted-foreground">{new Date(pet.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {pet.organization?.email && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2">Contact Information</h4>
                    <p className="text-sm text-muted-foreground">Email: {pet.organization.email}</p>
                    {pet.organization.website && (
                      <p className="text-sm text-muted-foreground">Website: {pet.organization.website}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
