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
import { Checkbox } from "@/components/ui/checkbox"

import { Heart, Mail, Lock, User, Building, Stethoscope, Phone, MapPin, Globe, FileText, Users, Clock } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

const daysOfWeek = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
]


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
  const [orgFormData, setOrgFormData] = useState({
    name: "",
    organizationType: "",
    description: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    website: "",
    licenseNumber: "",
    capacity: "",
  })

  const [orgHours, setOrgHours] = useState(
    daysOfWeek.map((day) => ({
      dayOfWeek: day.value,
      openTime: "",
      closeTime: "",
      isClosed: true,
    }))
  )

  const [servicesText, setServicesText] = useState("")
  const [specialtiesText, setSpecialtiesText] = useState("")


  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "prompt">("prompt")
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleOrgInputChange = (field: string, value: string) => {
    setOrgFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleOrgHourChange = (
    index: number,
    field: "openTime" | "closeTime" | "isClosed",
    value: string | boolean
  ) => {
    setOrgHours((prev) => {
      const next = [...prev]
      next[index] = {
        ...next[index],
        [field]: value,
      }
      if (field === "isClosed" && value === true) {
        next[index].openTime = ""
        next[index].closeTime = ""
      }
      return next
    })
  }


  const [organizations, setOrganizations] = useState<any[]>([])
  const [selectedOrganization, setSelectedOrganization] = useState<string>("")
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false)

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
      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
        role: userType, // Use selected user type
        // Include location data for veterinarian and shelter types
        ...(userType !== "citizen" && userType !== "organization" && {
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
  const handleOrganizationRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    if (
      !orgFormData.name.trim() ||
      !orgFormData.organizationType ||
      !orgFormData.address.trim() ||
      !orgFormData.city.trim() ||
      !orgFormData.state.trim() ||
      !orgFormData.zipCode.trim() ||
      !orgFormData.phone.trim() ||
      !orgFormData.email.trim()
    ) {
      setError("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    try {
      const organizationHours = orgHours.map((h) => ({
        dayOfWeek: h.dayOfWeek,
        openTime: h.isClosed || !h.openTime ? null : h.openTime,
        closeTime: h.isClosed || !h.closeTime ? null : h.closeTime,
        isClosed: h.isClosed,
      }))

      const organizationServices = servicesText
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((serviceName) => ({ serviceName }))

      const organizationSpecialties = specialtiesText
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((specialty) => ({ specialty }))

      const organizationData = {
        name: orgFormData.name.trim(),
        organizationType: orgFormData.organizationType,
        description: orgFormData.description.trim() || undefined,
        address: orgFormData.address.trim(),
        city: orgFormData.city.trim(),
        state: orgFormData.state.trim(),
        zipCode: orgFormData.zipCode.trim(),
        coordinates: coordinates ? `POINT(${coordinates.lng} ${coordinates.lat})` : "POINT(0 0)",
        phone: orgFormData.phone.trim(),
        email: orgFormData.email.trim(),
        website: orgFormData.website.trim() || undefined,
        licenseNumber: orgFormData.licenseNumber.trim() || undefined,
        capacity: orgFormData.capacity ? parseInt(orgFormData.capacity) : undefined,
        organizationHours,
        organizationServices,
        organizationSpecialties,
      }

      console.log("Creating organization:", organizationData)

      const response = await apiClient.registerOrganization(organizationData)

      if (response.error) {
        setError(response.error)
      } else {
        alert("Organization registered successfully! It will be reviewed and verified by our team.")
        router.push("/")
      }
    } catch (error) {
      console.error("Organization creation error:", error)
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
              <Tabs
                value={userType}
                onValueChange={setUserType}
                className="w-full"
              >
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
                      Don't see your organization? Switch to the <span className="font-medium">Organization</span>{" "}
                      tab above to register a new one, then return here to complete your account registration.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Organization Registration Form */}
            {userType === "organization" && (
              <form onSubmit={handleOrganizationRegister} className="space-y-6 mb-8">
                {/* Error Display */}
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {/* Organization type and name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgType">Organization Type</Label>
                    <Select
                      value={orgFormData.organizationType}
                      onValueChange={(value) => handleOrgInputChange("organizationType", value)}
                    >
                      <SelectTrigger id="orgType">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shelter">Shelter</SelectItem>
                        <SelectItem value="rescue">Rescue</SelectItem>
                        <SelectItem value="veterinary_clinic">Veterinary Clinic</SelectItem>
                        <SelectItem value="sanctuary">Sanctuary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input
                      id="orgName"
                      placeholder="Name of your organization"
                      value={orgFormData.name}
                      onChange={(e) => handleOrgInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="orgDescription">Description (optional)</Label>
                  <Textarea
                    id="orgDescription"
                    placeholder="Describe your shelter, rescue, or clinic"
                    value={orgFormData.description}
                    onChange={(e) => handleOrgInputChange("description", e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <Label className="text-base font-medium">Location</Label>
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

                  {coordinates && (
                    <div className="mb-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-xs text-green-700 dark:text-green-300">
                        Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="orgAddress">Address</Label>
                      <Input
                        id="orgAddress"
                        placeholder="Street address"
                        value={orgFormData.address}
                        onChange={(e) => handleOrgInputChange("address", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orgCity">City</Label>
                      <Input
                        id="orgCity"
                        placeholder="City"
                        value={orgFormData.city}
                        onChange={(e) => handleOrgInputChange("city", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orgState">State/Province</Label>
                      <Input
                        id="orgState"
                        placeholder="State or Province"
                        value={orgFormData.state}
                        onChange={(e) => handleOrgInputChange("state", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orgZip">ZIP/Postal Code</Label>
                      <Input
                        id="orgZip"
                        placeholder="ZIP or Postal Code"
                        value={orgFormData.zipCode}
                        onChange={(e) => handleOrgInputChange("zipCode", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgPhone">Phone</Label>
                    <Input
                      id="orgPhone"
                      placeholder="Primary contact phone"
                      value={orgFormData.phone}
                      onChange={(e) => handleOrgInputChange("phone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgEmail">Email</Label>
                    <Input
                      id="orgEmail"
                      type="email"
                      placeholder="Organization email"
                      value={orgFormData.email}
                      onChange={(e) => handleOrgInputChange("email", e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="orgWebsite">Website (optional)</Label>
                    <Input
                      id="orgWebsite"
                      placeholder="https://example.org"
                      value={orgFormData.website}
                      onChange={(e) => handleOrgInputChange("website", e.target.value)}
                    />
                  </div>
                </div>

                {/* Hours */}
                <div className="space-y-3">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Operating Hours
                  </Label>
                  <div className="space-y-2">
                    {daysOfWeek.map((day, index) => (
                      <div key={day.value} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`closed-${day.value}`}
                            checked={orgHours[index].isClosed}
                            onCheckedChange={(checked) =>
                              handleOrgHourChange(index, "isClosed", Boolean(checked))
                            }
                          />
                          <Label htmlFor={`closed-${day.value}`} className="flex-1 flex justify-between text-sm">
                            <span>{day.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {orgHours[index].isClosed ? "Closed" : "Open"}
                            </span>
                          </Label>
                        </div>
                        <Input
                          type="time"
                          value={orgHours[index].openTime}
                          onChange={(e) => handleOrgHourChange(index, "openTime", e.target.value)}
                          disabled={orgHours[index].isClosed}
                        />
                        <Input
                          type="time"
                          value={orgHours[index].closeTime}
                          onChange={(e) => handleOrgHourChange(index, "closeTime", e.target.value)}
                          disabled={orgHours[index].isClosed}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Services & Specialties */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="services">Services (comma separated)</Label>
                    <Textarea
                      id="services"
                      placeholder="Adoption, Fostering, Vaccinations..."
                      value={servicesText}
                      onChange={(e) => setServicesText(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialties">Specialties (comma separated)</Label>
                    <Textarea
                      id="specialties"
                      placeholder="Senior dogs, Medical cases, Behavior rehab..."
                      value={specialtiesText}
                      onChange={(e) => setSpecialtiesText(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Additional info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number (optional)</Label>
                    <Input
                      id="licenseNumber"
                      value={orgFormData.licenseNumber}
                      onChange={(e) => handleOrgInputChange("licenseNumber", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity (optional)</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min={0}
                      value={orgFormData.capacity}
                      onChange={(e) => handleOrgInputChange("capacity", e.target.value)}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Registering organization..." : "Register Organization"}
                </Button>
              </form>
            )}

            {userType !== "organization" && (
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
              {userType !== "citizen" && userType !== "organization" && (
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
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          )}

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
