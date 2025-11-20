"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { NavigationHeader } from "@/components/navigation-header"
import {
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Heart
} from "lucide-react"

export default function AdoptionApplicationsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("All")
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [isReviewing, setIsReviewing] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (!isLoading && user && (user.role === "veterinarian" || user.role === "shelter")) {
      fetchApplications()
    }
  }, [user, isLoading, statusFilter])

  const fetchApplications = async () => {
    if (!user?.organizationId) {
      console.log("No organizationId found for user:", user)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("Fetching applications for organizationId:", user.organizationId, "status:", statusFilter)
      const response = await apiClient.getAdoptionApplications({
        organizationId: user.organizationId,
        status: statusFilter !== "All" ? statusFilter.toLowerCase() : undefined
      })

      console.log("Applications response:", response)

      if (response.error) {
        console.error("Error fetching applications:", response.error)
        setError(response.error)
      } else if (response.data) {
        // Backend returns array directly
        console.log("Applications data:", response.data)
        setApplications(Array.isArray(response.data) ? response.data : [])
      } else {
        console.log("No data in response")
        setApplications([])
      }
    } catch (err: any) {
      console.error("Exception fetching applications:", err)
      setError(err.message || "Failed to load applications")
    } finally {
      setLoading(false)
    }
  }

  const handleReviewApplication = async (applicationId: string, status: "approved" | "rejected") => {
    if (!user) return

    setIsReviewing(true)

    try {
      const response = await apiClient.request(`/adoptionapplications/${applicationId}`, {
        method: "PUT",
        body: JSON.stringify({
          status,
          reviewNotes,
          reviewedBy: user.id,
          reviewedAt: new Date().toISOString()
        })
      })

      if (response.error) {
        alert("Error: " + response.error)
      } else {
        alert(`Application ${status} successfully!`)
        setSelectedApplication(null)
        setReviewNotes("")
        fetchApplications()
      }
    } catch (err: any) {
      alert("Error: " + err.message)
    } finally {
      setIsReviewing(false)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (user.role !== "veterinarian" && user.role !== "shelter") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Only shelters and veterinarians can view adoption applications.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      submitted: "bg-blue-500",
      approved: "bg-green-500",
      rejected: "bg-red-500",
      pending: "bg-yellow-500"
    }

    return (
      <Badge className={`${statusColors[status.toLowerCase()] || "bg-gray-500"} text-white`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Adoption Applications</h1>
          <p className="text-muted-foreground">Review and manage adoption applications for your animals</p>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-8 text-center text-red-600">
              {error}
            </CardContent>
          </Card>
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No applications found</p>
              <p className="text-xs text-muted-foreground mt-2">
                Organization ID: {user?.organizationId || "Not set"}
              </p>
              <p className="text-xs text-muted-foreground">
                Status Filter: {statusFilter}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {applications.map((application) => {
              console.log("Application object:", application)
              console.log("Animal:", application.animal)
              console.log("Applicant:", application.applicant)
              console.log("Organization:", application.organization)
              const appData = JSON.parse(application.applicationData || "{}")
              console.log("Parsed application data:", appData)

              return (
                <Card key={application.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="w-5 h-5 text-primary" />
                          {application.animal?.name || "Unknown Animal"}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4" />
                            {application.applicant?.firstName} {application.applicant?.lastName}
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(application.status)}
                        <span className="text-xs text-muted-foreground">
                          {new Date(application.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{application.applicant?.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{application.applicant?.phone || appData.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm col-span-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{appData.address}, {appData.city}, {appData.state} {appData.zipCode}</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => setSelectedApplication(application)}
                      variant="outline"
                      className="w-full"
                    >
                      View Full Application
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Application Detail Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <Card className="max-w-4xl w-full my-8">
              <CardHeader className="sticky top-0 bg-card z-10 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Application Details</CardTitle>
                    <CardDescription>
                      For {selectedApplication.animal?.name} by {selectedApplication.applicant?.firstName} {selectedApplication.applicant?.lastName}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedApplication(null)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="max-h-[70vh] overflow-y-auto">
                {(() => {
                  const appData = JSON.parse(selectedApplication.applicationData || "{}")

                  return (
                    <div className="space-y-6">
                      {/* Applicant Info */}
                      <div>
                        <h3 className="font-semibold mb-3">Applicant Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Name:</span>
                            <p className="font-medium">{appData.firstName} {appData.lastName}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Email:</span>
                            <p className="font-medium">{appData.email}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Phone:</span>
                            <p className="font-medium">{appData.phone}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Address:</span>
                            <p className="font-medium">{appData.address}, {appData.city}, {appData.state} {appData.zipCode}</p>
                          </div>
                        </div>
                      </div>

                      {/* Housing Info */}
                      <div>
                        <h3 className="font-semibold mb-3">Housing Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Housing Type:</span>
                            <p className="font-medium">{appData.housingType}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Own/Rent:</span>
                            <p className="font-medium">{appData.ownRent}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Yard Type:</span>
                            <p className="font-medium">{appData.yardType}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Fenced:</span>
                            <p className="font-medium">{appData.fenced}</p>
                          </div>
                        </div>
                      </div>

                      {/* Experience */}
                      <div>
                        <h3 className="font-semibold mb-3">Experience & Lifestyle</h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Pet Experience:</span>
                            <p className="font-medium">{appData.petExperience}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Current Pets:</span>
                            <p className="font-medium">{appData.currentPets}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Why Adopt:</span>
                            <p className="font-medium">{appData.whyAdopt}</p>
                          </div>
                        </div>
                      </div>

                      {/* Review Info if already reviewed */}
                      {selectedApplication.status !== "submitted" && selectedApplication.reviewNotes && (
                        <div className="border-t pt-6">
                          <h3 className="font-semibold mb-3">Review Information</h3>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Status:</span>
                              <p className="font-medium">{getStatusBadge(selectedApplication.status)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Review Notes:</span>
                              <p className="font-medium">{selectedApplication.reviewNotes}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Reviewed At:</span>
                              <p className="font-medium">{new Date(selectedApplication.reviewedAt).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </CardContent>

              {/* Review Section - Fixed at bottom */}
              {selectedApplication.status === "submitted" && (
                <div className="border-t bg-card p-6 sticky bottom-0">
                  <h3 className="font-semibold mb-3">Review Application</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reviewNotes">Review Notes</Label>
                      <Textarea
                        id="reviewNotes"
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add notes about your decision..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleReviewApplication(selectedApplication.id, "approved")}
                        disabled={isReviewing}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReviewApplication(selectedApplication.id, "rejected")}
                        disabled={isReviewing}
                        variant="outline"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

