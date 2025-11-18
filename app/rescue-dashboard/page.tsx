"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NavigationHeader } from "@/components/navigation-header"
import { AlertTriangle, MapPin, Calendar, Phone, Mail, Search, Filter, Eye, ChevronDown, ChevronUp, Building, User } from "lucide-react"
import Link from "next/link"

export default function RescueDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [urgencyFilter, setUrgencyFilter] = useState("All")
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set())

  // Check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchReports()
    }
  }, [searchTerm, statusFilter, urgencyFilter, isAuthenticated])

  const fetchReports = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.getRescueReports({
        search: searchTerm || undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        urgency: urgencyFilter !== "All" ? urgencyFilter : undefined,
        sortBy: "createdAt",
        pageSize: 50,
      })

      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        setReports(response.data.reports || [])
      }
    } catch (err) {
      console.error("Error fetching reports:", err)
      setError("Failed to load rescue reports")
    }

    setLoading(false)
  }

  const toggleReportDetails = (reportId: string) => {
    const newExpanded = new Set(expandedReports)
    if (newExpanded.has(reportId)) {
      newExpanded.delete(reportId)
    } else {
      newExpanded.add(reportId)
    }
    setExpandedReports(newExpanded)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "destructive"
      case "assigned": return "secondary"
      case "in_progress": return "default"
      case "resolved": return "outline"
      default: return "secondary"
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case "critical": return "destructive"
      case "high": return "destructive"
      case "medium": return "secondary"
      case "low": return "outline"
      default: return "secondary"
    }
  }

  if (loading && reports.length === 0) {
    return (
      <>
        <NavigationHeader />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading rescue reports...</p>
          </div>
        </div>
      </>
    )
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <>
        <NavigationHeader />
        <div className="min-h-screen bg-background py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Show access denied if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <NavigationHeader />
        <div className="min-h-screen bg-background py-8 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-4">You need to be logged in to access the rescue dashboard.</p>
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <NavigationHeader />
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">PetRescue Connect</span>
              </div>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold">Rescue Reports Dashboard</h1>
              <p className="text-muted-foreground">
                View all rescue reports in the system
              </p>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Statuses</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Assigned">Assigned</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Urgency</label>
                  <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Urgencies</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="mb-6 border-destructive">
              <CardContent className="pt-6">
                <div className="text-center text-destructive">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reports List */}
          {!loading && !error && (
            <>
              {reports.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Reports Found</h3>
                      <p className="text-muted-foreground mb-6">
                        No rescue reports match your current filters.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {reports.map((report) => (
                    <Card key={report.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5" />
                              Rescue Report #{report.id.slice(0, 8)}
                            </CardTitle>
                            <CardDescription>
                              {report.animalType} - {report.breed || 'Unknown breed'}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getUrgencyColor(report.urgencyLevel) as any}>
                              {report.urgencyLevel}
                            </Badge>
                            <Badge variant={getStatusColor(report.status) as any}>
                              {report.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <p className="text-muted-foreground">{report.description}</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span>{report.locationAddress}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span>{report.contactPhone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span>{report.contactEmail}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-4 border-t">
                            <div className="text-sm text-muted-foreground">
                              Reported by: {report.contactName}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleReportDetails(report.id)}
                            >
                              {expandedReports.has(report.id) ? (
                                <>
                                  <ChevronUp className="w-4 h-4 mr-2" />
                                  Hide Details
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4 mr-2" />
                                  View Details
                                </>
                              )}
                            </Button>
                          </div>

                          {/* Expanded Details Section */}
                          {expandedReports.has(report.id) && (
                            <div className="mt-6 pt-6 border-t space-y-6">
                              {/* Additional Details */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-sm">Animal Condition</h4>
                                  <p className="text-sm text-muted-foreground">{report.animalCondition}</p>
                                </div>
                                {report.breed && (
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Breed</h4>
                                    <p className="text-sm text-muted-foreground">{report.breed}</p>
                                  </div>
                                )}
                                {report.size && (
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Size</h4>
                                    <p className="text-sm text-muted-foreground">{report.size}</p>
                                  </div>
                                )}
                                {report.color && (
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Color</h4>
                                    <p className="text-sm text-muted-foreground">{report.color}</p>
                                  </div>
                                )}
                              </div>

                              {/* Assigned Organization */}
                              {report.assignedOrganization && (
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-sm flex items-center gap-2">
                                    <Building className="w-4 h-4" />
                                    Assigned Organization
                                  </h4>
                                  <div className="bg-muted/50 p-4 rounded-lg">
                                    <div className="space-y-2">
                                      <p className="font-medium">{report.assignedOrganization.name}</p>
                                      {report.assignedOrganization.email && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <Mail className="w-4 h-4" />
                                          <span>{report.assignedOrganization.email}</span>
                                        </div>
                                      )}
                                      {report.assignedOrganization.phone && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <Phone className="w-4 h-4" />
                                          <span>{report.assignedOrganization.phone}</span>
                                        </div>
                                      )}
                                      {report.assignedOrganization.address && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <MapPin className="w-4 h-4" />
                                          <span>{report.assignedOrganization.address}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Photos */}
                              {report.rescueReportPhotos && report.rescueReportPhotos.length > 0 && (
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-sm">Photos</h4>
                                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {report.rescueReportPhotos.map((photo: any) => (
                                      <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                                        {photo.photoData ? (
                                          <img
                                            src={`data:${photo.contentType};base64,${photo.photoData}`}
                                            alt={photo.fileName || 'Rescue photo'}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                            onClick={() => {
                                              // Open image in a modal or new tab
                                              const newWindow = window.open()
                                              if (newWindow) {
                                                newWindow.document.write(`<img src="data:${photo.contentType};base64,${photo.photoData}" style="max-width:100%;max-height:100%;" />`)
                                              }
                                            }}
                                          />
                                        ) : photo.photoUrl ? (
                                          <img
                                            src={photo.photoUrl}
                                            alt={photo.fileName || 'Rescue photo'}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                            onClick={() => window.open(photo.photoUrl, '_blank')}
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                            <Eye className="w-8 h-8" />
                                          </div>
                                        )}
                                        {photo.caption && (
                                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
                                            {photo.caption}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Additional Notes */}
                              {report.notes && (
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-sm">Notes</h4>
                                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">{report.notes}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
