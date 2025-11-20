"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Building, MapPin, Phone, Mail, Globe, FileText, Users } from "lucide-react"
import Link from "next/link"

const daysOfWeek = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
]

export default function OrganizationRegisterPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null)

  const [formData, setFormData] = useState({
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

  const [hours, setHours] = useState(
    daysOfWeek.map((day) => ({
      dayOfWeek: day.value,
      openTime: "",
      closeTime: "",
      isClosed: true,
    }))
  )

  const [servicesText, setServicesText] = useState("")
  const [specialtiesText, setSpecialtiesText] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleHourChange = (
    index: number,
    field: "openTime" | "closeTime" | "isClosed",
    value: string | boolean
  ) => {
    setHours((prev) => {
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
      
    } catch (error: any) {
      console.error("Error getting location:", error)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    // Validation
    if (!formData.name.trim() || !formData.organizationType || !formData.address.trim() || 
        !formData.city.trim() || !formData.state.trim() || !formData.zipCode.trim() ||
        !formData.phone.trim() || !formData.email.trim()) {
      setError("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    try {
      const organizationHours = hours.map((h) => ({
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
        name: formData.name.trim(),
        organizationType: formData.organizationType,
        description: formData.description.trim() || undefined,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zipCode: formData.zipCode.trim(),
        coordinates: coordinates ? `POINT(${coordinates.lng} ${coordinates.lat})` : "POINT(0 0)",
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        website: formData.website.trim() || undefined,
        licenseNumber: formData.licenseNumber.trim() || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mb-4">
              <Building className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Register Organization
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Create a new organization profile for your shelter, rescue, or veterinary clinic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Organization Type */}
              <div className="space-y-2">
                <Label htmlFor="organizationType">Organization Type *</Label>
                <Select value={formData.organizationType} onValueChange={(value) => handleInputChange("organizationType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shelter">Animal Shelter</SelectItem>
                    <SelectItem value="rescue">Animal Rescue</SelectItem>
                    <SelectItem value="veterinary_clinic">Veterinary Clinic</SelectItem>
                    <SelectItem value="sanctuary">Animal Sanctuary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Organization Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name *</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Enter organization name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your organization's mission and services"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                />
              </div>

              {/* Location Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <Label className="text-base font-medium">Location Information</Label>
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
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Location captured successfully</span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                    </p>
                  </div>
                )}

                {/* Address Fields */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      placeholder="Enter street address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        placeholder="State"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        placeholder="ZIP Code"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Contact Information</Label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Phone number"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Email address"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://your-website.com"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Operating Hours</Label>
                <p className="text-xs text-muted-foreground">
                  Set the hours your organization is open. Mark days as closed when not operating.
                </p>
                <div className="space-y-2">
                  {daysOfWeek.map((day, index) => {
                    const hour = hours[index]
                    return (
                      <div
                        key={day.value}
                        className="grid grid-cols-1 md:grid-cols-[1.2fr,1fr,1fr] items-center gap-2 md:gap-3"
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`day-${day.value}-closed`}
                            checked={hour.isClosed}
                            onCheckedChange={(checked) =>
                              handleHourChange(index, "isClosed", checked === true)
                            }
                          />
                          <Label
                            htmlFor={`day-${day.value}-closed`}
                            className="flex-1 text-sm font-medium"
                          >
                            {day.label}
                          </Label>
                          <span className="text-[11px] text-muted-foreground">
                            {hour.isClosed ? "Closed" : "Open"}
                          </span>
                        </div>
                        <Input
                          type="time"
                          value={hour.openTime}
                          onChange={(e) =>
                            handleHourChange(index, "openTime", e.target.value)
                          }
                          disabled={hour.isClosed}
                        />
                        <Input
                          type="time"
                          value={hour.closeTime}
                          onChange={(e) =>
                            handleHourChange(index, "closeTime", e.target.value)
                          }
                          disabled={hour.isClosed}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Services and Specialties */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Services &amp; Specialties</Label>

                <div className="space-y-2">
                  <Label htmlFor="services">Services Offered</Label>
                  <Textarea
                    id="services"
                    placeholder="Example: Adoption, Fostering, Vaccinations, Microchipping"
                    value={servicesText}
                    onChange={(e) => setServicesText(e.target.value)}
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate services with commas. These help citizens know what you provide.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialties">Specialties</Label>
                  <Textarea
                    id="specialties"
                    placeholder="Example: Senior dogs, Feral cats, Exotic birds"
                    value={specialtiesText}
                    onChange={(e) => setSpecialtiesText(e.target.value)}
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate specialties with commas. These map directly to organization_specialties.
                  </p>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Additional Information</Label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number (Optional)</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="licenseNumber"
                        placeholder="License or registration number"
                        value={formData.licenseNumber}
                        onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity (Optional)</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="capacity"
                        type="number"
                        placeholder="Maximum animal capacity"
                        value={formData.capacity}
                        onChange={(e) => handleInputChange("capacity", e.target.value)}
                        className="pl-10"
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium py-3"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating Organization...
                    </>
                  ) : (
                    "Create Organization"
                  )}
                </Button>

                <div className="text-center">
                  <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    ← Back to User Registration
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
