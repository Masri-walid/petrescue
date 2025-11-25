"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MapPin,
  Phone,
  Clock,
  PawPrint,
  Search,
  Star,
  Building,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { apiClient } from "@/lib/api"
import { getProfileImageUrl } from "@/lib/profile-image-utils"
import { NavigationHeader } from "@/components/navigation-header"

export default function SheltersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("All Types")
  const [sortBy, setSortBy] = useState("name")
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500) // Wait 500ms after user stops typing

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    fetchData()
  }, [debouncedSearchTerm, typeFilter, sortBy])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch users who are vets or shelters (NOT organizations)
      const usersResponse = await apiClient.request('/auth/users/by-type', {
        method: 'GET',
      })

      if (usersResponse.data) {
        // The backend now filters to only vets and shelters, so no need to filter again
        let searchFilteredUsers = usersResponse.data

        // Apply search filter to users if needed
        if (debouncedSearchTerm) {
          const searchLower = debouncedSearchTerm.toLowerCase()
          searchFilteredUsers = usersResponse.data.filter((user: any) => {
            // Search in name
            const nameMatch = user.firstName?.toLowerCase().includes(searchLower) ||
                             user.lastName?.toLowerCase().includes(searchLower)

            // Search in location
            const locationMatch = user.address?.toLowerCase().includes(searchLower) ||
                                 user.city?.toLowerCase().includes(searchLower) ||
                                 user.state?.toLowerCase().includes(searchLower) ||
                                 user.zipCode?.toLowerCase().includes(searchLower)

            // Search in details/description
            const detailsMatch = user.bio?.toLowerCase().includes(searchLower) ||
                                user.specialties?.some((s: string) => s.toLowerCase().includes(searchLower))

            return nameMatch || locationMatch || detailsMatch
          })
        }

        // Apply type filter to users
        if (typeFilter !== "All Types") {
          if (typeFilter === "Veterinary Clinic") {
            searchFilteredUsers = searchFilteredUsers.filter((user: any) => user.userType === 'veterinarian')
          } else if (typeFilter === "Animal Shelter") {
            searchFilteredUsers = searchFilteredUsers.filter((user: any) => user.userType === 'shelter')
          }
        }

        setUsers(searchFilteredUsers)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
    }

    setLoading(false)
  }

  // Convert users to organization-like format for display
  const userOrganizations = users.map((user) => {
    // Use the user's profile picture if available, otherwise fall back to their primary or first gallery photo
    const primaryPhoto = user.userPhotos?.find((photo: any) => photo.isPrimary) || user.userPhotos?.[0]
    const photoUrl = getProfileImageUrl(user.profileImageUrl || primaryPhoto?.photoUrl)

    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      organizationType: user.userType === 'veterinarian' ? 'veterinary_clinic' : 'shelter',
      description: `${user.userType === 'veterinarian' ? 'Veterinarian' : 'Shelter'} - Individual Provider`,
      address: user.address || 'Address not provided',
      city: user.city || '',
      state: user.state || '',
      zipCode: user.zipCode || '',
      phone: user.phone || '',
      email: user.email || '',
      website: null,
      licenseNumber: null,
      capacity: null,
      currentAnimalCount: 0,
      rating: null,
      reviewCount: 0,
      isVerified: user.isVerified || false,
      isFeatured: false,
      profileImageUrl: photoUrl,
      isUser: true, // Flag to identify this as a user entry
      userPhotos: user.userPhotos || [] // Include all photos for potential gallery view
    }
  })

  if (loading && users.length === 0) {
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
          <p className="text-red-500 mb-4">Error loading shelters and rescues: {error}</p>
          <Button onClick={fetchData}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            <Building className="w-4 h-4 mr-1" />
            Find Shelters & Rescues
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Animal Shelters & Rescues</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with local shelters and rescue organizations to adopt pets, volunteer, or get help with animal
            rescue.
          </p>
        </div>

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
                <SelectItem value="Veterinary Clinic">Veterinary Clinic</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Found {users.length} shelters and rescues
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">All Shelters & Rescues</h2>
            {userOrganizations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No shelters or rescues found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {userOrganizations.map((userOrg) => (
                  <ShelterCard key={`user-${userOrg.id}`} shelter={userOrg} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ShelterCard({ shelter, featured = false }: { shelter: any; featured?: boolean }) {
  const imageUrl = shelter.profileImageUrl || "/animal-shelter-exterior.jpg"

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
          src={imageUrl}
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
            <Link href={shelter.isUser ? `/shelters/${shelter.id}?user=true` : `/shelters/${shelter.id}`}>
              View Details
            </Link>
          </Button>
          <Button variant="outline" size="icon" className="bg-transparent">
            <Phone className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
