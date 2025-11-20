"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { X, Send, CheckCircle } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

interface AdoptionApplicationFormProps {
  petName: string
  animalId: string
  organizationId: string
  onClose: () => void
}

export default function AdoptionApplicationForm({ petName, animalId, organizationId, onClose }: AdoptionApplicationFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    // Personal Information - Auto-filled from user data
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    zipCode: user?.zipCode || "",

    // Housing Information
    housingType: "",
    ownRent: "",
    landlordPermission: "",
    yardType: "",
    fenced: "",

    // Experience & Lifestyle
    petExperience: "",
    currentPets: "",
    veterinarian: "",
    hoursAlone: "",
    exerciseTime: "",

    // References
    reference1Name: "",
    reference1Phone: "",
    reference2Name: "",
    reference2Phone: "",

    // Additional Information
    whyAdopt: "",
    expectations: "",

    // Agreements
    agreeTerms: false,
    agreeVisit: false,
    agreeContact: false,
  })

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setSubmitError("You must be logged in to submit an application")
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Prepare application data as JSON
      const applicationData = {
        animalId,
        applicantId: user.id,
        organizationId,
        applicationData: JSON.stringify(formData),
        status: "submitted"
      }

      const response = await apiClient.createAdoptionApplication(applicationData)

      if (response.error) {
        setSubmitError(response.error)
      } else {
        setSubmitSuccess(true)
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    } catch (error: any) {
      setSubmitError(error.message || "Failed to submit application")
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Adoption Application</CardTitle>
            <CardDescription>Apply to adopt {petName}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent>
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round((currentStep / totalSteps) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Application Submitted Successfully!</p>
                <p className="text-sm text-green-700">The shelter will review your application soon.</p>
              </div>
            </div>
          )}

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Housing Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Housing Information</h3>

                <div className="space-y-2">
                  <Label>Housing Type</Label>
                  <Select
                    value={formData.housingType}
                    onValueChange={(value) => handleInputChange("housingType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select housing type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Do you own or rent?</Label>
                  <RadioGroup value={formData.ownRent} onValueChange={(value) => handleInputChange("ownRent", value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="own" id="own" />
                      <Label htmlFor="own">Own</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="rent" id="rent" />
                      <Label htmlFor="rent">Rent</Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.ownRent === "rent" && (
                  <div className="space-y-2">
                    <Label>Do you have landlord permission for pets?</Label>
                    <RadioGroup
                      value={formData.landlordPermission}
                      onValueChange={(value) => handleInputChange("landlordPermission", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="permission-yes" />
                        <Label htmlFor="permission-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="permission-no" />
                        <Label htmlFor="permission-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Yard Type</Label>
                  <Select value={formData.yardType} onValueChange={(value) => handleInputChange("yardType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select yard type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="large">Large Yard</SelectItem>
                      <SelectItem value="small">Small Yard</SelectItem>
                      <SelectItem value="none">No Yard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.yardType !== "none" && (
                  <div className="space-y-2">
                    <Label>Is your yard fenced?</Label>
                    <RadioGroup value={formData.fenced} onValueChange={(value) => handleInputChange("fenced", value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="fenced-yes" />
                        <Label htmlFor="fenced-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="fenced-no" />
                        <Label htmlFor="fenced-no">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="partial" id="fenced-partial" />
                        <Label htmlFor="fenced-partial">Partially</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Experience & Lifestyle */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Experience & Lifestyle</h3>

                <div className="space-y-2">
                  <Label htmlFor="petExperience">Describe your experience with pets</Label>
                  <Textarea
                    id="petExperience"
                    value={formData.petExperience}
                    onChange={(e) => handleInputChange("petExperience", e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentPets">Do you currently have pets? If yes, please describe</Label>
                  <Textarea
                    id="currentPets"
                    value={formData.currentPets}
                    onChange={(e) => handleInputChange("currentPets", e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="veterinarian">Current veterinarian (name and phone)</Label>
                  <Input
                    id="veterinarian"
                    value={formData.veterinarian}
                    onChange={(e) => handleInputChange("veterinarian", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>How many hours per day would the pet be alone?</Label>
                  <Select value={formData.hoursAlone} onValueChange={(value) => handleInputChange("hoursAlone", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hours" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-2">0-2 hours</SelectItem>
                      <SelectItem value="3-4">3-4 hours</SelectItem>
                      <SelectItem value="5-6">5-6 hours</SelectItem>
                      <SelectItem value="7-8">7-8 hours</SelectItem>
                      <SelectItem value="9+">9+ hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>How much time can you dedicate to exercise/play daily?</Label>
                  <Select
                    value={formData.exerciseTime}
                    onValueChange={(value) => handleInputChange("exerciseTime", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30min">30 minutes</SelectItem>
                      <SelectItem value="1hour">1 hour</SelectItem>
                      <SelectItem value="2hours">2 hours</SelectItem>
                      <SelectItem value="3+hours">3+ hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 4: Final Information */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Final Information</h3>

                <div className="space-y-4">
                  <h4 className="font-medium">References (2 required)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reference1Name">Reference 1 Name</Label>
                      <Input
                        id="reference1Name"
                        value={formData.reference1Name}
                        onChange={(e) => handleInputChange("reference1Name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reference1Phone">Reference 1 Phone</Label>
                      <Input
                        id="reference1Phone"
                        value={formData.reference1Phone}
                        onChange={(e) => handleInputChange("reference1Phone", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reference2Name">Reference 2 Name</Label>
                      <Input
                        id="reference2Name"
                        value={formData.reference2Name}
                        onChange={(e) => handleInputChange("reference2Name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reference2Phone">Reference 2 Phone</Label>
                      <Input
                        id="reference2Phone"
                        value={formData.reference2Phone}
                        onChange={(e) => handleInputChange("reference2Phone", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whyAdopt">Why do you want to adopt {petName}?</Label>
                  <Textarea
                    id="whyAdopt"
                    value={formData.whyAdopt}
                    onChange={(e) => handleInputChange("whyAdopt", e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Agreements</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="agreeTerms"
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked) => handleInputChange("agreeTerms", checked as boolean)}
                      />
                      <Label htmlFor="agreeTerms" className="text-sm">
                        I agree to the terms and conditions of adoption
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="agreeVisit"
                        checked={formData.agreeVisit}
                        onCheckedChange={(checked) => handleInputChange("agreeVisit", checked as boolean)}
                      />
                      <Label htmlFor="agreeVisit" className="text-sm">
                        I agree to a home visit before adoption
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="agreeContact"
                        checked={formData.agreeContact}
                        onCheckedChange={(checked) => handleInputChange("agreeContact", checked as boolean)}
                      />
                      <Label htmlFor="agreeContact" className="text-sm">
                        I agree to be contacted for follow-up after adoption
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="bg-transparent"
              >
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!formData.agreeTerms || !formData.agreeVisit || !formData.agreeContact || isSubmitting || submitSuccess}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Submitting...
                    </>
                  ) : submitSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submitted
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
