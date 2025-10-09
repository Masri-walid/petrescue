"use client"

import type React from "react"
import { apiClient } from "@/lib/api"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Camera, MapPin, Upload, AlertTriangle, Phone, Clock, ArrowLeft, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function RescuePage() {
  const [formData, setFormData] = useState({
    animalType: "",
    urgency: "",
    condition: "",
    location: "",
    description: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
  })
  const [photos, setPhotos] = useState<File[]>([])
  // Removed temporary photo IDs - using direct upload now
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [useCurrentLocation, setUseCurrentLocation] = useState(false)
  const [coordinates, setCoordinates] = useState<{latitude: number, longitude: number} | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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

  const getCurrentLocation = () => {
    setUseCurrentLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCoordinates({ latitude, longitude })
          // Also update the location field with a readable address placeholder
          handleInputChange("location", `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
          setUseCurrentLocation(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setUseCurrentLocation(false)
        },
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Map form data to API expected format
      const reportData = {
        animalType: formData.animalType,
        urgencyLevel: formData.urgency,
        animalCondition: formData.condition,
        location: formData.location,
        description: formData.description,
        reporterName: formData.contactName,
        reporterPhone: formData.contactPhone,
        reporterEmail: formData.contactEmail,
        latitude: coordinates?.latitude || 45.5017, // Default to Montreal coordinates if no location
        longitude: coordinates?.longitude || -73.5673, // Default to Montreal coordinates if no location
      }

      const response = await apiClient.createRescueReport(reportData, photos)

      if (response.error) {
        alert(`Error submitting report: ${response.error}`)
      } else {
        // Clear form and redirect to success
        setFormData({
          animalType: "",
          urgency: "",
          condition: "",
          location: "",
          description: "",
          contactName: "",
          contactPhone: "",
          contactEmail: "",
        })
        setPhotos([])
        alert("Rescue report submitted successfully! Nearby shelters have been notified.")
      }
    } catch (error) {
      console.error("Error submitting rescue report:", error)
      alert("Failed to submit rescue report. Please try again.")
    }

    setIsSubmitting(false)
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
      })
      setStream(mediaStream)
      setShowCamera(true)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Unable to access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
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
              const file = new File([blob], `rescue-photo-${Date.now()}.jpg`, { type: "image/jpeg" })
              setPhotos((prev) => [...prev, file])
            }
          },
          "image/jpeg",
          0.8,
        )
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">PetRescue Connect</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium">Emergency: 1-800-RESCUE</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <Badge variant="destructive" className="mb-4">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Rescue Report
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Report a Stray Animal</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Help us locate and rescue animals in need. Your report will be sent to nearby shelters and volunteers
            immediately.
          </p>
        </div>

        {/* Emergency Notice */}
        <Card className="mb-8 border-destructive/20 bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-destructive mb-2">Emergency Situations</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  If the animal is severely injured, trapped, or in immediate danger, please call our emergency hotline
                  first.
                </p>
                <Button variant="destructive" size="sm">
                  <Phone className="w-4 h-4 mr-2" />
                  Call 1-800-RESCUE
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Animal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Animal Information</CardTitle>
                  <CardDescription>Tell us about the animal you found</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="animalType">Animal Type</Label>
                      <Select
                        value={formData.animalType}
                        onValueChange={(value) => handleInputChange("animalType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select animal type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dog">Dog</SelectItem>
                          <SelectItem value="cat">Cat</SelectItem>
                          <SelectItem value="puppy">Puppy</SelectItem>
                          <SelectItem value="kitten">Kitten</SelectItem>
                          <SelectItem value="rabbit">Rabbit</SelectItem>
                          <SelectItem value="bird">Bird</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="urgency">Urgency Level</Label>
                      <Select value={formData.urgency} onValueChange={(value) => handleInputChange("urgency", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical - Severely injured</SelectItem>
                          <SelectItem value="urgent">Urgent - Injured or sick</SelectItem>
                          <SelectItem value="moderate">Moderate - Needs help</SelectItem>
                          <SelectItem value="low">Low - Healthy but stray</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition">Animal Condition</Label>
                    <Textarea
                      id="condition"
                      placeholder="Describe the animal's condition, behavior, and any visible injuries..."
                      value={formData.condition}
                      onChange={(e) => handleInputChange("condition", e.target.value)}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Additional Details</Label>
                    <Textarea
                      id="description"
                      placeholder="Any other important information (size, color, collar, etc.)..."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                  <CardDescription>Help us find the animal quickly</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={getCurrentLocation}
                      disabled={useCurrentLocation}
                      className="flex items-center gap-2 bg-transparent"
                    >
                      <MapPin className="w-4 h-4" />
                      {useCurrentLocation ? "Getting Location..." : "Use Current Location"}
                    </Button>
                    <span className="text-sm text-muted-foreground">or enter manually below</span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Address or Coordinates</Label>
                    <Input
                      id="location"
                      placeholder="Enter street address or GPS coordinates"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Photos */}
              <Card>
                <CardHeader>
                  <CardTitle>Photos</CardTitle>
                  <CardDescription>Clear photos help rescuers identify and locate the animal</CardDescription>
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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Contact Info</CardTitle>
                  <CardDescription>So we can update you on the rescue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Name</Label>
                    <Input
                      id="contactName"
                      placeholder="Your full name"
                      value={formData.contactName}
                      onChange={(e) => handleInputChange("contactName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="Your phone number"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="Your email address"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* What Happens Next */}
              <Card>
                <CardHeader>
                  <CardTitle>What Happens Next?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">1</span>
                      </div>
                      <div>
                        <p className="font-medium">Immediate Alert</p>
                        <p className="text-muted-foreground">Nearby shelters and volunteers are notified instantly</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">2</span>
                      </div>
                      <div>
                        <p className="font-medium">Rescue Dispatch</p>
                        <p className="text-muted-foreground">Trained volunteers head to the location</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">3</span>
                      </div>
                      <div>
                        <p className="font-medium">Updates</p>
                        <p className="text-muted-foreground">You'll receive updates on the rescue progress</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Submitting Report...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Submit Rescue Report
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By submitting this report, you confirm the information is accurate and agree to be contacted about this
                rescue.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
