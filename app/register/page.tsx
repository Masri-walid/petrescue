"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Mail, Lock, User, Building, Stethoscope, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "prompt">("prompt")
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null)
  const [organizations, setOrganizations] = useState<any[]>([])
  const [selectedOrganization, setSelectedOrganization] = useState<string>("")
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser")
      return
    }

    setIsGettingLocation(true)
    setError("")

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        )
      })

      const { latitude, longitude } = position.coords
      setCoordinates({ lat: latitude, lng: longitude })
      setLocationPermission("granted")

      // Optionally, reverse geocode to fill address fields
      try {
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`
        )
        // Note: You'll need to add an API key for reverse geocoding
        // For now, we'll just store the coordinates
      } catch (geocodeError) {
        console.log("Reverse geocoding failed, but coordinates captured")
      }

    } catch (error: any) {
      console.error("Error getting location:", error)
      setLocationPermission("denied")
      if (error.code === 1) {
        setError("Location access denied. Please enable location services and try again.")
      } else if (error.code === 2) {
        setError("Location unavailable. Please check your connection and try again.")
      } else if (error.code === 3) {
        setError("Location request timed out. Please try again.")
      } else {
        setError("Unable to get your location. Please enter your address manually.")
      }
    } finally {
      setIsGettingLocation(false)
    }
  }

  const fetchOrganizations = async (organizationType: string) => {
    setIsLoadingOrganizations(true)
    try {
      const response = await apiClient.request(`/organizations?organizationType=${organizationType}`)
      if (response.error) {
        console.error("Error fetching organizations:", response.error)
        setOrganizations([])
      } else {
        setOrganizations(response.data || [])
      }
    } catch (error) {
      console.error("Error fetching organizations:", error)
      setOrganizations([])
    } finally {
      setIsLoadingOrganizations(false)
    }
  }

  // Fetch organizations when user type changes to veterinarian or shelter
  useEffect(() => {
    if (userType === "veterinarian") {
      fetchOrganizations("veterinary_clinic")
    } else if (userType === "shelter") {
      fetchOrganizations("shelter")
    } else {
      setOrganizations([])
      setSelectedOrganization("")
    }
  }, [userType])

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

      // Validate organization selection
      if (!selectedOrganization) {
        setError("Please select an organization. If no organizations are available, please contact an administrator or register your organization separately.")
        setIsSubmitting(false)
        return
      }
    }

    try {
      // Handle organization registration differently
      if (userType === "organization") {
        // Redirect directly to organization registration page
        router.push("/register/organization")
        return
      }

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
          coordinates: coordinates ? `POINT(${coordinates.lng} ${coordinates.lat})` : undefined,
          organizationId: selectedOrganization || undefined,
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
                <TabsList className="grid w-full grid-cols-4">
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
                  <TabsTrigger value="organization" className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <span className="hidden sm:inline">Organization</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-sm text-muted-foreground mt-2">
                {userType === "citizen" && "Report stray animals and browse adoptable pets"}
                {userType === "veterinarian" && "Provide medical care and health certifications"}
                {userType === "shelter" && "Manage rescue operations and animal adoptions"}
                {userType === "organization" && "Register a new organization (shelter, rescue, veterinary clinic, etc.)"}
              </p>
            </div>

            {/* Organization Selection - Only for Veterinarian and Shelter */}
            {(userType === "veterinarian" || userType === "shelter") && (
              <div className="mb-6">
                <Label className="text-base font-medium mb-4 block">
                  Organization Selection
                </Label>
                <div className="space-y-4">
                  {isLoadingOrganizations ? (
                    <div className="flex items-center gap-2 p-4 border rounded-lg">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading organizations...</span>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="organization">Select Organization</Label>
                        <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an existing organization or create new" />
                          </SelectTrigger>
                          <SelectContent>
                            {organizations.map((org) => (
                              <SelectItem key={org.id} value={org.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{org.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {org.city}, {org.state}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>


                    </>
                  )}

                  {/* Help message for organization registration */}
                  <div className="mt-4 p-3 bg-muted/50 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Don't see your organization? You can{" "}
                      <Link href="/register/organization" className="text-primary hover:underline font-medium">
                        register a new organization here
                      </Link>{" "}
                      and then return to complete your account registration.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Organization Registration Info */}
            {userType === "organization" && (
              <div className="mb-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">Organization Registration</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Click "Register Organization" below to proceed directly to the organization registration form where you can create a new shelter, rescue, veterinary clinic, or sanctuary.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <Label className="text-base font-medium">Location Information</Label>
                      <span className="text-sm text-muted-foreground">(Required for {userType}s)</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      className="flex items-center gap-2"
                    >
                      {isGettingLocation ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          Getting Location...
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4" />
                          Use Current Location
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Location status indicator */}
                  {coordinates && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Location captured successfully</span>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                      </p>
                    </div>
                  )}

                  {/* Manual address input fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="address"
                          type="text"
                          placeholder="Street address"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        type="text"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        type="text"
                        placeholder="State or Province"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                      <Input
                        id="zipCode"
                        type="text"
                        placeholder="ZIP or Postal Code"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      />
                    </div>
                  </div>
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
                {isSubmitting ? "Redirecting..." : userType === "organization" ? "Register Organization" : "Create Account"}
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
