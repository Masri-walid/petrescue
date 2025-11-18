"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Search, Filter, MapPin, Calendar, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { apiClient } from "@/lib/api"
import { NavigationHeader } from "@/components/navigation-header"

export default function AdoptPage() {
  const { user, isAuthenticated } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    type: "All Types",
    age: "All Ages",
    size: "All Sizes",
    location: "",
    favorites: false,
  })
  const [showFilters, setShowFilters] = useState(false)
  const [animals, setAnimals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [favoriteAnimals, setFavoriteAnimals] = useState<Set<string>>(new Set())
  const [favoritesList, setFavoritesList] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch user favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated || !user) return

      try {
        const response = await apiClient.getFavorites()
        if (response.data) {
          setFavoritesList(response.data)
          const favoriteIds = new Set(response.data.map((animal: any) => animal.id))
          setFavoriteAnimals(favoriteIds)
        }
      } catch (error) {
        console.error('Error fetching favorites:', error)
      }
    }

    fetchFavorites()
  }, [isAuthenticated, user])

  useEffect(() => {
    fetchAnimals()
  }, [searchTerm, filters, currentPage])

  const fetchAnimals = async () => {
    setLoading(true)
    setError(null)

    // If favorites filter is active, use favorites list
    if (filters.favorites) {
      let filteredFavorites = favoritesList

      // Apply other filters to favorites
      if (searchTerm) {
        filteredFavorites = filteredFavorites.filter(animal =>
          animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          animal.breed.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      if (filters.type !== "All Types") {
        filteredFavorites = filteredFavorites.filter(animal => animal.species === filters.type)
      }
      if (filters.age !== "All Ages") {
        filteredFavorites = filteredFavorites.filter(animal => animal.age === filters.age)
      }
      if (filters.size !== "All Sizes") {
        filteredFavorites = filteredFavorites.filter(animal => animal.size === filters.size)
      }

      setAnimals(filteredFavorites)
      setTotalCount(filteredFavorites.length)
      setLoading(false)
      return
    }

    const response = await apiClient.getAnimals({
      search: searchTerm || undefined,
      type: filters.type !== "All Types" ? filters.type : undefined,
      age: filters.age !== "All Ages" ? filters.age : undefined,
      size: filters.size !== "All Sizes" ? filters.size : undefined,
      status: "Available",
      page: currentPage,
      pageSize: 12,
      sortBy: "name",
    })

    if (response.error) {
      setError(response.error)
    } else if (response.data) {
      setAnimals(response.data.animals || [])
      setTotalCount(response.data.totalCount || 0)
    }

    setLoading(false)
  }

  const toggleFavorite = async (animalId: string) => {
    if (!isAuthenticated || !user) return

    try {
      const isFavorited = favoriteAnimals.has(animalId)

      if (isFavorited) {
        await apiClient.removeFromFavorites(animalId)
        setFavoriteAnimals(prev => {
          const newSet = new Set(prev)
          newSet.delete(animalId)
          return newSet
        })
        setFavoritesList(prev => prev.filter(animal => animal.id !== animalId))
      } else {
        await apiClient.addToFavorites(animalId)
        setFavoriteAnimals(prev => new Set(prev).add(animalId))

        // Find the animal and add to favorites list
        const animal = animals.find(a => a.id === animalId)
        if (animal) {
          setFavoritesList(prev => [...prev, animal])
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const featuredAnimals = animals?.filter((animal) => animal.featured) || []
  const regularAnimals = animals?.filter((animal) => !animal.featured) || []

  if (loading && (!animals || animals.length === 0)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading available pets...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading pets: {error}</p>
          <Button onClick={fetchAnimals}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            <Heart className="w-4 h-4 mr-1" />
            Find Your New Best Friend
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Adopt a Rescued Pet</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Give a rescued animal a loving home. Browse our available pets and start your adoption journey today.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or breed..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {isAuthenticated && (
              <Button
                variant={filters.favorites ? "default" : "outline"}
                onClick={() => setFilters(prev => ({ ...prev, favorites: !prev.favorites }))}
                className="flex items-center gap-2"
              >
                <Heart className={`w-4 h-4 ${filters.favorites ? 'fill-current' : ''}`} />
                Favorites {favoritesList.length > 0 && `(${favoritesList.length})`}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-transparent"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Select
                      value={filters.type}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Animal Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Types">All Types</SelectItem>
                        <SelectItem value="Dog">Dogs</SelectItem>
                        <SelectItem value="Cat">Cats</SelectItem>
                        <SelectItem value="Rabbit">Rabbits</SelectItem>
                        <SelectItem value="Bird">Birds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select
                      value={filters.age}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, age: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Age" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Ages">All Ages</SelectItem>
                        <SelectItem value="Puppy">Puppy/Kitten</SelectItem>
                        <SelectItem value="1">Young (1-2 years)</SelectItem>
                        <SelectItem value="3">Adult (3-7 years)</SelectItem>
                        <SelectItem value="8">Senior (8+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select
                      value={filters.size}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, size: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Sizes">All Sizes</SelectItem>
                        <SelectItem value="Small">Small</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setFilters({ type: "All Types", age: "All Ages", size: "All Sizes", location: "" })}
                    className="bg-transparent"
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {animals?.length || 0} of {totalCount} available pets
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Featured Pets */}
        {featuredAnimals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              Featured Pets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAnimals.map((animal) => (
                <PetCard
                  key={animal.id}
                  pet={animal}
                  featured
                  isFavorited={favoriteAnimals.has(animal.id)}
                  onToggleFavorite={toggleFavorite}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Available Pets */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Available for Adoption</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularAnimals.map((animal) => (
              <PetCard
                key={animal.id}
                pet={animal}
                isFavorited={favoriteAnimals.has(animal.id)}
                onToggleFavorite={toggleFavorite}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        </div>

        {animals.length === 0 && !loading && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No pets found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or check back later for new arrivals.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setFilters({ type: "All Types", age: "All Ages", size: "All Sizes", location: "", favorites: false })
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function PetCard({
  pet,
  featured = false,
  isFavorited = false,
  onToggleFavorite,
  isAuthenticated = false
}: {
  pet: any;
  featured?: boolean;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
  isAuthenticated?: boolean;
}) {
  // Look for primary photo in animalPhotos array, fallback to first photo
  const primaryPhoto = pet.animalPhotos?.find((p: any) => p.isPrimary) || pet.animalPhotos?.[0]

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

      <div className="aspect-[4/3] relative overflow-hidden">
        <Image
          src={primaryPhoto?.photoUrl || "/a-cute-pet.png"}
          alt={pet.name}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          {isAuthenticated && onToggleFavorite && (
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
              onClick={(e) => {
                e.preventDefault()
                onToggleFavorite(pet.id)
              }}
            >
              <Heart
                className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
              />
            </Button>
          )}
          <Badge variant={pet.healthStatus === "Excellent" ? "default" : "secondary"}>{pet.healthStatus}</Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{pet.name}</CardTitle>
            <CardDescription>
              {pet.breed} • {pet.age}
            </CardDescription>
          </div>
          <Badge variant="outline">${pet.adoptionFee}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{pet.description}</p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{pet.organization?.name || 'Unknown Organization'}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {pet.vaccinated && (
            <Badge variant="secondary" className="text-xs">
              Vaccinated
            </Badge>
          )}
          {pet.spayedNeutered && (
            <Badge variant="secondary" className="text-xs">
              Spayed/Neutered
            </Badge>
          )}
          {pet.goodWithKids && (
            <Badge variant="secondary" className="text-xs">
              Good with Kids
            </Badge>
          )}
          {pet.goodWithPets && (
            <Badge variant="secondary" className="text-xs">
              Good with Pets
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Rescued {pet.rescueDate ? new Date(pet.rescueDate).toLocaleDateString() : "Recently"}
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            {pet.energyLevel} Energy
          </Badge>
        </div>

        <div className="flex gap-2 pt-2">
          <Button asChild className="flex-1">
            <Link href={`/adopt/${pet.id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
