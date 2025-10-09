"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Heart,
  Plus,
  Search,
  Bell,
  MapPin,
  Calendar,
  Users,
  PawPrint,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  Edit,
  Eye,
  MoreHorizontal,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { apiClient } from "@/lib/api"

export default function ShelterDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data states
  const [stats, setStats] = useState({
    totalAnimals: 0,
    availableForAdoption: 0,
    pendingApplications: 0,
    recentRescues: 0,
    adoptionsThisMonth: 0,
    volunteersActive: 0,
  })
  const [recentRescues, setRecentRescues] = useState<any[]>([])
  const [animals, setAnimals] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (activeTab === "animals") {
      fetchAnimals()
    } else if (activeTab === "applications") {
      fetchApplications()
    } else if (activeTab === "rescues") {
      fetchRescueReports()
    }
  }, [activeTab, searchTerm, statusFilter])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch animals for stats
      const animalsResponse = await apiClient.getAnimals({ pageSize: 1000 })
      const rescuesResponse = await apiClient.getRescueReports({ pageSize: 10, sortBy: "createdAt" })
      const applicationsResponse = await apiClient.getAdoptionApplications({ pageSize: 1000 })

      if (animalsResponse.data) {
        const animals = animalsResponse.data.animals
        setStats({
          totalAnimals: animals.length,
          availableForAdoption: animals.filter((a) => a.status === "Available").length,
          pendingApplications:
            applicationsResponse.data?.applications.filter((a) => a.status === "Pending").length || 0,
          recentRescues: rescuesResponse.data?.reports.length || 0,
          adoptionsThisMonth: animals.filter(
            (a) => a.status === "Adopted" && new Date(a.adoptionDate).getMonth() === new Date().getMonth(),
          ).length,
          volunteersActive: 28, // This would come from a volunteers API
        })
      }

      if (rescuesResponse.data) {
        setRecentRescues(rescuesResponse.data.reports.slice(0, 3))
      }

      if (applicationsResponse.data) {
        setApplications(applicationsResponse.data.applications.filter((a) => a.status === "Pending").slice(0, 3))
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Failed to load dashboard data")
    }

    setLoading(false)
  }

  const fetchAnimals = async () => {
    const response = await apiClient.getAnimals({
      search: searchTerm || undefined,
      status: statusFilter !== "All" ? statusFilter : undefined,
      sortBy: "name",
      pageSize: 50,
    })

    if (response.data) {
      setAnimals(response.data.animals)
    }
  }

  const fetchApplications = async () => {
    const response = await apiClient.getAdoptionApplications({
      sortBy: "createdAt",
      pageSize: 50,
    })

    if (response.data) {
      setApplications(response.data.applications)
    }
  }

  const fetchRescueReports = async () => {
    const response = await apiClient.getRescueReports({
      sortBy: "createdAt",
      pageSize: 50,
    })

    if (response.data) {
      setRecentRescues(response.data.reports)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Critical":
        return "destructive"
      case "Urgent":
        return "destructive"
      case "Moderate":
        return "secondary"
      case "Available":
        return "default"
      case "Medical Care":
        return "secondary"
      case "Adoption Pending":
        return "default"
      case "Approved":
        return "default"
      case "Under Review":
      case "Pending":
        return "secondary"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
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
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">PetRescue Connect</span>
              </Link>
              <Badge variant="secondary">Happy Paws Shelter</Badge>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="bg-transparent">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                <Badge variant="destructive" className="ml-2 px-1 py-0 text-xs">
                  {stats.pendingApplications}
                </Badge>
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Animal
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Animals</p>
                  <p className="text-2xl font-bold">{stats.totalAnimals}</p>
                </div>
                <PawPrint className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold text-green-600">{stats.availableForAdoption}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Applications</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.pendingApplications}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New Rescues</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.recentRescues}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Adoptions</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.adoptionsThisMonth}</p>
                </div>
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Volunteers</p>
                  <p className="text-2xl font-bold text-teal-600">{stats.volunteersActive}</p>
                </div>
                <Users className="w-8 h-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="animals">Animals</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="rescues">Rescues</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Rescue Reports */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Recent Rescue Reports
                  </CardTitle>
                  <CardDescription>Latest animal rescue requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentRescues.slice(0, 3).map((rescue) => (
                      <div key={rescue.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getStatusColor(rescue.urgency) as any}>{rescue.urgency}</Badge>
                            <span className="text-sm font-medium">{rescue.animalType}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{rescue.location}</p>
                          <p className="text-xs text-muted-foreground">
                            Reported by {rescue.contactName} • {new Date(rescue.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{rescue.status}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {rescue.assignedOrganization || "Unassigned"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4 bg-transparent">
                    View All Rescue Reports
                  </Button>
                </CardContent>
              </Card>

              {/* Pending Applications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Pending Applications
                  </CardTitle>
                  <CardDescription>Applications requiring review</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applications
                      .filter((app) => app.status === "Pending")
                      .slice(0, 3)
                      .map((application) => (
                        <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{application.applicantName}</p>
                            <p className="text-sm text-muted-foreground">Wants to adopt {application.animalName}</p>
                            <p className="text-xs text-muted-foreground">
                              Applied {new Date(application.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" variant="outline" className="bg-transparent">
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button size="sm">Review</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4 bg-transparent">
                    View All Applications
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                    <Plus className="w-6 h-6" />
                    Add New Animal
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                    <AlertTriangle className="w-6 h-6" />
                    Emergency Rescue
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                    <Users className="w-6 h-6" />
                    Manage Volunteers
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                    <Calendar className="w-6 h-6" />
                    Schedule Visit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Animals Tab */}
          <TabsContent value="animals" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search animals by name, breed, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Medical Care">Medical Care</SelectItem>
                  <SelectItem value="Adoption Pending">Adoption Pending</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Animal
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {animals.map((animal) => {
                const primaryPhoto = animal.photos?.find((p: any) => p.isPrimary) || animal.photos?.[0]
                return (
                  <Card key={animal.id} className="overflow-hidden">
                    <div className="aspect-[4/3] relative">
                      <Image
                        src={primaryPhoto?.filePath ? `/api${primaryPhoto.filePath}` : "/a-cute-pet.png"}
                        alt={animal.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant={getStatusColor(animal.status) as any}>{animal.status}</Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{animal.name}</CardTitle>
                          <CardDescription>
                            {animal.breed} • {animal.age}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">ID: {animal.id}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Health:</span>
                        <Badge variant="secondary">{animal.healthStatus}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Arrival:</span>
                        <span>{new Date(animal.rescueDate || animal.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          <Edit className="w-3 h-3 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="bg-transparent">
                          <Eye className="w-3 h-3 mr-2" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="bg-transparent">
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Adoption Applications</h2>
              <div className="flex gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Applications</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="scheduled">Home Visit Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {applications.map((application) => (
                <Card key={application.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold">{application.applicantName}</h3>
                          <Badge variant={getStatusColor(application.status) as any}>{application.status}</Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">
                          Wants to adopt <strong>{application.animalName}</strong> (ID: {application.animalId})
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {application.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Applied {new Date(application.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Phone className="w-4 h-4 mr-2" />
                          Contact
                        </Button>
                        {application.status === "Pending" && <Button size="sm">Review Application</Button>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Rescues Tab */}
          <TabsContent value="rescues" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Rescue Operations</h2>
              <Button>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Emergency Dispatch
              </Button>
            </div>

            <div className="space-y-4">
              {recentRescues.map((rescue) => (
                <Card key={rescue.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold">Rescue #{rescue.id}</h3>
                          <Badge variant={getStatusColor(rescue.urgency) as any}>{rescue.urgency}</Badge>
                          <Badge variant="outline">{rescue.status}</Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">
                          <strong>{rescue.animalType}</strong> reported at {rescue.location}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            Reported by {rescue.contactName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(rescue.createdAt).toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {rescue.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <MapPin className="w-4 h-4 mr-2" />
                          View Location
                        </Button>
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Phone className="w-4 h-4 mr-2" />
                          Contact Reporter
                        </Button>
                        {rescue.status === "Pending" && <Button size="sm">Assign Team</Button>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
