"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Navigation, Loader2 } from "lucide-react"

interface LocationPickerProps {
  onLocationSelect: (location: { address: string; coordinates: { lat: number; lng: number } }) => void
  initialAddress?: string
}

export default function LocationPicker({ onLocationSelect, initialAddress = "" }: LocationPickerProps) {
  const [address, setAddress] = useState(initialAddress)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser")
      return
    }

    setIsGettingLocation(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          // In a real app, you would use a geocoding service like Google Maps API
          // For demo purposes, we'll simulate reverse geocoding
          const mockAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          setAddress(mockAddress)
          onLocationSelect({
            address: mockAddress,
            coordinates: { lat: latitude, lng: longitude },
          })
        } catch (error) {
          setLocationError("Failed to get address for current location")
        } finally {
          setIsGettingLocation(false)
        }
      },
      (error) => {
        setIsGettingLocation(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied by user")
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable")
            break
          case error.TIMEOUT:
            setLocationError("Location request timed out")
            break
          default:
            setLocationError("An unknown error occurred while getting location")
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    )
  }

  const handleAddressChange = (newAddress: string) => {
    setAddress(newAddress)
    // In a real app, you would geocode the address to get coordinates
    // For demo purposes, we'll use mock coordinates
    if (newAddress.trim()) {
      onLocationSelect({
        address: newAddress,
        coordinates: { lat: 39.7817, lng: -89.6501 }, // Mock coordinates
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Location
        </CardTitle>
        <CardDescription>Enter an address or use your current location</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="Enter street address, city, or coordinates"
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="flex items-center gap-2 bg-transparent"
          >
            {isGettingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            {isGettingLocation ? "Getting Location..." : "Use Current Location"}
          </Button>
        </div>

        {locationError && <p className="text-sm text-destructive">{locationError}</p>}

        <div className="text-xs text-muted-foreground">
          <p>
            Your location helps us find the nearest shelters and volunteers for faster rescue response. Location data is
            only used for this purpose and is not stored permanently.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
