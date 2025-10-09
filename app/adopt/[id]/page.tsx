"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, ArrowLeft, MapPin, Calendar, Phone, Mail, Share2, Star, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"

// Mock pet data - in real app this would come from API
const mockPet = {
  id: "1",
  name: "Luna",
  type: "Dog",
  breed: "Golden Retriever Mix",
  age: "2 years",
  gender: "Female",
  size: "Large",
  weight: "55 lbs",
  location: "Happy Paws Shelter, Downtown",
  distance: "2.3 miles",
  description:
    "Luna is a gentle, loving dog who gets along great with children and other pets. She was rescued from the streets and has made remarkable progress in her training. Luna loves long walks, playing fetch, and cuddling on the couch. She would thrive in a home with a yard where she can run and play.",
  photos: ["/golden-retriever-dog-playing.jpg", "/golden-retriever-dog-sitting.jpg", "/golden-retriever-dog-with-toy.jpg"],
  vaccinated: true,
  spayed: true,
  microchipped: true,
  goodWithKids: true,
  goodWithPets: true,
  goodWithCats: false,
  energyLevel: "Medium",
  adoptionFee: 150,
  featured: true,
  rescueDate: "2024-01-15",
  healthStatus: "Excellent",
  specialNeeds: false,
  houseTrained: true,
  personality: ["Friendly", "Gentle", "Playful", "Loyal"],
  medicalHistory: "Fully vaccinated, spayed, microchipped. No known health issues.",
  shelterInfo: {
    name: "Happy Paws Shelter",
    phone: "(555) 123-4567",
    email: "adopt@happypaws.org",
    address: "123 Main St, Downtown",
    hours: "Mon-Sat 10am-6pm, Sun 12pm-5pm",
  },
}

export default function PetDetailPage() {
  const params = useParams()
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showApplicationForm, setShowApplicationForm] = useState(false)

  // In real app, fetch pet data based on params.id
  const pet = mockPet

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
                  src={pet.photos[currentPhotoIndex] || "/placeholder.svg"}
                  alt={`${pet.name} photo ${currentPhotoIndex + 1}`}
                  fill
                  className="object-cover"
                />
                {pet.featured && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-yellow-500 text-yellow-900">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <Badge variant={pet.healthStatus === "Excellent" ? "default" : "secondary"}>{pet.healthStatus}</Badge>
                </div>
              </div>

              {pet.photos.length > 1 && (
                <div className="p-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {pet.photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          currentPhotoIndex === index ? "border-primary" : "border-transparent"
                        }`}
                      >
                        <Image
                          src={photo || "/placeholder.svg"}
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
                    <CardTitle className="text-3xl">{pet.name}</CardTitle>
                    <CardDescription className="text-lg">
                      {pet.breed} • {pet.age} • {pet.gender}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">${pet.adoptionFee}</div>
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
                            <span>{pet.size}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Weight:</span>
                            <span>{pet.weight}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Energy Level:</span>
                            <span>{pet.energyLevel}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Compatibility</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Good with Kids:</span>
                            {pet.goodWithKids ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Good with Dogs:</span>
                            {pet.goodWithPets ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Good with Cats:</span>
                            {pet.goodWithCats ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="personality" className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3">Personality Traits</h4>
                      <div className="flex flex-wrap gap-2">
                        {pet.personality.map((trait) => (
                          <Badge key={trait} variant="secondary">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">House Trained:</span>
                        {pet.houseTrained ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Special Needs:</span>
                        {pet.specialNeeds ? (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="medical" className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3">Medical Status</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Vaccinated:</span>
                          {pet.vaccinated ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Spayed/Neutered:</span>
                          {pet.spayed ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Microchipped:</span>
                          {pet.microchipped ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{pet.medicalHistory}</p>
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
                    <p className="font-medium">{pet.shelterInfo.name}</p>
                    <p className="text-sm text-muted-foreground">{pet.shelterInfo.address}</p>
                    <p className="text-sm text-muted-foreground">{pet.distance} away</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Rescue Date</p>
                    <p className="text-sm text-muted-foreground">{new Date(pet.rescueDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Shelter Hours</h4>
                  <p className="text-sm text-muted-foreground">{pet.shelterInfo.hours}</p>
                </div>
              </CardContent>
            </Card>

            {/* Similar Pets */}
            <Card>
              <CardHeader>
                <CardTitle>Similar Pets</CardTitle>
                <CardDescription>You might also like these pets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                      <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden">
                        <Image
                          src={`/happy-dog-owner.png?height=48&width=48&query=pet ${i}`}
                          alt={`Similar pet ${i}`}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Pet Name {i}</p>
                        <p className="text-xs text-muted-foreground">Breed • Age</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 bg-transparent">
                  View All Similar Pets
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
