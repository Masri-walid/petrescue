"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Search, Filter, MapPin, Calendar, ArrowLeft, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { apiClient } from "@/lib/api"

export default function AdoptPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    type: "All Types",
    age: "All Ages",
    size: "All Sizes",
    location: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [animals, setAnimals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchAnimals()
  }, [searchTerm, filters, currentPage])

  const fetchAnimals = async () => {
    setLoading(true)
    setError(null)

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
      setAnimals(response.data.animals)
      setTotalCount(response.data.totalCount)
    }

    setLoading(false)
  }

  const featuredAnimals = animals.filter((animal) => animal.featured)
  const regularAnimals = animals.filter((animal) => !animal.featured)

  if (loading && animals.length === 0) {
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
      {/* Header */}
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
              <Link href="/shelters" className="text-muted-foreground hover:text-foreground transition-colors">
                Shelters
              </Link>
            </nav>
          </div>
        </div>
      </header>

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
            Showing {animals.length} of {totalCount} available pets
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
                <PetCard key={animal.id} pet={animal} featured />
              ))}
            </div>
          </div>
        )}

        {/* All Available Pets */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Available for Adoption</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularAnimals.map((animal) => (
              <PetCard key={animal.id} pet={animal} />
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
                setFilters({ type: "All Types", age: "All Ages", size: "All Sizes", location: "" })
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

function PetCard({ pet, featured = false }: { pet: any; featured?: boolean }) {
  const primaryPhoto = pet.photos?.find((p: any) => p.isPrimary) || pet.photos?.[0]

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
          src={primaryPhoto?.filePath ? `/api${primaryPhoto.filePath}` : "/a-cute-pet.png"}
          alt={pet.name}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
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
          <span>{pet.organizationName}</span>
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
          <Button variant="outline" size="icon" className="bg-transparent">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
