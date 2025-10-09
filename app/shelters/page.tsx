"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import {
  Heart,
  MapPin,
  Phone,
  Clock,
  PawPrint,
  Navigation,
  Search,
  ArrowLeft,
  Star,
  LucideCaptions as Directions,
  Settings,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { apiClient } from "@/lib/api"

export default function SheltersPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("All Types")
  const [sortBy, setSortBy] = useState("distance")
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "pending">("pending")
  const [searchRadius, setSearchRadius] = useState([30])
  const [showRadiusControl, setShowRadiusControl] = useState(false)
  const [organizations, setOrganizations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setLocationPermission("granted")
        },
        (error) => {
          console.error("Error getting location:", error)
          setLocationPermission("denied")
        },
      )
    }
  }, [])

  useEffect(() => {
    fetchOrganizations()
  }, [searchTerm, typeFilter, sortBy, userLocation, searchRadius])

  const fetchOrganizations = async () => {
    setLoading(true)
    setError(null)

    const response = await apiClient.getOrganizations({
      search: searchTerm || undefined,
      type: typeFilter !== "All Types" ? typeFilter : undefined,
      latitude: userLocation?.lat,
      longitude: userLocation?.lng,
      radius: searchRadius[0],
      sortBy: sortBy,
    })

    if (response.error) {
      setError(response.error)
    } else if (response.data) {
      setOrganizations(response.data)
    }

    setLoading(false)
  }

  const featuredOrganizations = organizations.filter((org) => org.featured)
  const regularOrganizations = organizations.filter((org) => !org.featured)

  const requestLocation = () => {
    if (navigator.geolocation) {
      setLocationPermission("pending")
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setLocationPermission("granted")
        },
        (error) => {
          console.error("Error getting location:", error)
          setLocationPermission("denied")
        },
      )
    }
  }

  if (loading && organizations.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shelters and rescues...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading organizations: {error}</p>
          <Button onClick={fetchOrganizations}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">PetRescue Connect</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/rescue" className="text-muted-foreground hover:text-foreground transition-colors">
                Report Rescue
              </Link>
              <Link href="/adopt" className="text-muted-foreground hover:text-foreground transition-colors">
                Adopt
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            <MapPin className="w-4 h-4 mr-1" />
            Find Local Shelters
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Animal Shelters & Rescues Near You</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with local shelters and rescue organizations to adopt pets, volunteer, or get help with animal
            rescue.
          </p>
        </div>

        {locationPermission === "denied" && (
          <Card className="mb-6 border-orange-200 bg-orange-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Navigation className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-800">Enable location for better results</p>
                    <p className="text-sm text-orange-700">
                      Allow location access to find shelters near you and get accurate distances
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={requestLocation} className="bg-transparent">
                  Enable Location
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, location, or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Organization Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Types">All Types</SelectItem>
                <SelectItem value="Animal Shelter">Animal Shelters</SelectItem>
                <SelectItem value="Rescue Organization">Rescue Organizations</SelectItem>
                <SelectItem value="Animal Sanctuary">Animal Sanctuaries</SelectItem>
                <SelectItem value="Veterinary Clinic">Veterinary Clinics</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setShowRadiusControl(!showRadiusControl)}
              className="bg-transparent"
            >
              <Settings className="w-4 h-4 mr-2" />
              Radius
            </Button>
          </div>

          {showRadiusControl && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Search Radius</span>
                    <span className="text-sm font-medium">{searchRadius[0]} km</span>
                  </div>
                  <Slider
                    value={searchRadius}
                    onValueChange={setSearchRadius}
                    max={100}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5 km</span>
                    <span>50 km</span>
                    <span>100 km</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Found {organizations.length} shelters and vets
              {userLocation && ` within ${searchRadius[0]} km`}
            </p>
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "map")}>
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="map">Map View</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {viewMode === "list" ? (
          <div className="space-y-8">
            {featuredOrganizations.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500" />
                  Featured Shelters
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {featuredOrganizations.map((organization) => (
                    <ShelterCard key={organization.id} shelter={organization} featured />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold mb-4">All Shelters & Rescues</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {regularOrganizations.map((organization) => (
                  <ShelterCard key={organization.id} shelter={organization} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Card className="h-96">
            <CardContent className="p-6 h-full flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Interactive Map</h3>
                <p className="text-muted-foreground">
                  Map view would show shelter locations with interactive markers and directions
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function ShelterCard({ shelter, featured = false }: { shelter: any; featured?: boolean }) {
  const isOpen = () => {
    if (!shelter.hours || typeof shelter.hours !== "object") return false

    const now = new Date()
    const day = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
    const currentTime = now.toLocaleTimeString("en-US", { hour12: false })
    const todayHours = shelter.hours[day]

    if (!todayHours || todayHours === "Closed") return false

    try {
      const [open, close] = todayHours.split(" - ")
      const openTime = new Date(`1970-01-01 ${open}`).toLocaleTimeString("en-US", { hour12: false })
      const closeTime = new Date(`1970-01-01 ${close}`).toLocaleTimeString("en-US", { hour12: false })

      return currentTime >= openTime && currentTime <= closeTime
    } catch {
      return false
    }
  }

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow ${featured ? "ring-2 ring-yellow-200" : ""}`}>
      {featured && (
        <div className="bg-yellow-100 px-3 py-1 text-center">
          <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
            <Star className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        </div>
      )}

      <div className="aspect-[3/2] relative overflow-hidden">
        <Image
          src="/animal-shelter-exterior.jpg"
          alt={shelter.name}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <Badge variant={isOpen() ? "default" : "secondary"}>{isOpen() ? "Open" : "Closed"}</Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{shelter.name}</CardTitle>
            <CardDescription>{shelter.type}</CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="font-medium">{shelter.rating}</span>
              <span className="text-sm text-muted-foreground">({shelter.reviewCount})</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p>{shelter.address}</p>
            <p className="text-muted-foreground">
              {shelter.city}, {shelter.state} {shelter.zipCode}
              {shelter.distance && ` • ${shelter.distance.toFixed(1)} km`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {shelter.specialties?.slice(0, 3).map((specialty: string) => (
            <Badge key={specialty} variant="secondary" className="text-xs">
              {specialty}
            </Badge>
          ))}
          {shelter.specialties?.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{shelter.specialties.length - 3} more
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <PawPrint className="w-4 h-4 text-muted-foreground" />
            <span>
              {shelter.currentAnimals}/{shelter.capacity} animals
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{isOpen() ? "Open now" : "Closed"}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button asChild className="flex-1">
            <Link href={`/shelters/${shelter.id}`}>View Details</Link>
          </Button>
          <Button variant="outline" size="icon" className="bg-transparent">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="bg-transparent">
            <Directions className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
