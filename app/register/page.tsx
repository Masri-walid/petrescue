"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Mail, Lock, User, Building, Stethoscope, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import LocationPicker from "@/components/location-picker"

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const defaultType = searchParams.get("type") || "citizen"
  const router = useRouter()

  const [userType, setUserType] = useState(defaultType)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  })
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLocationSelect = (location: { address: string; coordinates: { lat: number; lng: number } }) => {
    setCoordinates(location.coordinates)
    // Parse the address into components (this is a simple implementation)
    const addressParts = location.address.split(',').map(part => part.trim())
    if (addressParts.length >= 1) {
      setFormData(prev => ({
        ...prev,
        address: addressParts[0] || location.address,
        city: addressParts[1] || '',
        state: addressParts[2] || '',
        zipCode: addressParts[3] || ''
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        address: location.address
      }))
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsSubmitting(false)
      return
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsSubmitting(false)
      return
    }

    // Validate location fields for veterinarian and shelter
    if (userType !== "citizen") {
      if (!formData.address.trim() || !formData.city.trim() || !formData.state.trim() || !formData.zipCode.trim()) {
        setError("Address, city, state, and ZIP code are required for veterinarians and shelters")
        setIsSubmitting(false)
        return
      }
    }

    try {
      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
        role: userType, // Use selected user type
        // Include location data for veterinarian and shelter types
        ...(userType !== "citizen" && {
          address: formData.address.trim() || undefined,
          city: formData.city.trim() || undefined,
          state: formData.state.trim() || undefined,
          zipCode: formData.zipCode.trim() || undefined,
          latitude: coordinates?.lat,
          longitude: coordinates?.lng,
        }),
      }

      console.log("Registration attempt:", registrationData)

      const response = await apiClient.register(registrationData)

      if (response.error) {
        setError(response.error)
      } else if (response.data?.success && response.data?.token) {
        // Registration successful - note: backend returns lowercase 'success' and 'token'
        apiClient.setToken(response.data.token)
        console.log("Registration successful:", response.data)

        // Show success message before redirect
        alert("Registration successful! Welcome to PetRescue Connect!")

        // Redirect to dashboard or home
        router.push("/")
      } else if (response.data?.success === false) {
        setError(response.data.message || "Registration failed. Please try again.")
      } else {
        console.log("Registration response:", response.data)
        setError("Registration failed. Please try again.")
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError("Network error. Please check your connection and try again.")
    }

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">PetRescue Connect</span>
          </Link>
          <h1 className="text-3xl font-bold">Join Our Mission</h1>
          <p className="text-muted-foreground">Create your account and start helping animals today</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Create Your Account
            </CardTitle>
            <CardDescription>Choose your account type and join our community</CardDescription>
          </CardHeader>
          <CardContent>
            {/* User Type Selection */}
            <div className="mb-6">
              <Label className="text-base font-medium mb-4 block">Account Type</Label>
              <Tabs value={userType} onValueChange={setUserType} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="citizen" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Citizen</span>
                  </TabsTrigger>
                  <TabsTrigger value="veterinarian" className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" />
                    <span className="hidden sm:inline">Veterinarian</span>
                  </TabsTrigger>
                  <TabsTrigger value="shelter" className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <span className="hidden sm:inline">Shelter</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-sm text-muted-foreground mt-2">
                {userType === "citizen" && "Report stray animals and browse adoptable pets"}
                {userType === "veterinarian" && "Provide medical care and health certifications"}
                {userType === "shelter" && "Manage rescue operations and animal adoptions"}
              </p>
            </div>
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Location Fields - Only for Veterinarian and Shelter */}
              {userType !== "citizen" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <Label className="text-base font-medium">Location Information</Label>
                    <span className="text-sm text-muted-foreground">(Required for {userType}s)</span>
                  </div>

                  <LocationPicker
                    onLocationSelect={handleLocationSelect}
                    initialAddress={formData.address}
                  />

                  {/* Display parsed address components for verification */}
                  {(formData.address || formData.city || formData.state || formData.zipCode) && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <Label className="text-sm font-medium mb-2 block">Parsed Address:</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {formData.address && <div><strong>Address:</strong> {formData.address}</div>}
                        {formData.city && <div><strong>City:</strong> {formData.city}</div>}
                        {formData.state && <div><strong>State:</strong> {formData.state}</div>}
                        {formData.zipCode && <div><strong>ZIP:</strong> {formData.zipCode}</div>}
                        {coordinates && (
                          <div className="md:col-span-2">
                            <strong>Coordinates:</strong> {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            By creating an account, you agree to our Terms of Service and Privacy Policy. Together, we can make a
            difference in animal welfare.
          </p>
        </div>
      </div>
    </div>
  )
}
