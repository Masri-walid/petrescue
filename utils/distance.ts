// Utility functions for calculating distances between coordinates

export interface Coordinates {
  lat: number
  lng: number
}

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @returns Distance in miles
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRadians(coord2.lat - coord1.lat)
  const dLng = toRadians(coord2.lng - coord1.lng)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 10) / 10 // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 * @param degrees Degrees to convert
 * @returns Radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Find the nearest locations to a given coordinate
 * @param userLocation User's current location
 * @param locations Array of locations with coordinates
 * @param limit Maximum number of results to return
 * @returns Sorted array of locations with distances
 */
export function findNearestLocations<T extends { coordinates: Coordinates }>(
  userLocation: Coordinates,
  locations: T[],
  limit?: number,
): (T & { distance: number })[] {
  const locationsWithDistance = locations.map((location) => ({
    ...location,
    distance: calculateDistance(userLocation, location.coordinates),
  }))

  const sorted = locationsWithDistance.sort((a, b) => a.distance - b.distance)

  return limit ? sorted.slice(0, limit) : sorted
}

/**
 * Check if a coordinate is within a certain radius of another coordinate
 * @param center Center coordinate
 * @param point Point to check
 * @param radiusMiles Radius in miles
 * @returns True if point is within radius
 */
export function isWithinRadius(center: Coordinates, point: Coordinates, radiusMiles: number): boolean {
  const distance = calculateDistance(center, point)
  return distance <= radiusMiles
}

/**
 * Get the bounds (bounding box) for a given center point and radius
 * @param center Center coordinate
 * @param radiusMiles Radius in miles
 * @returns Bounding box coordinates
 */
export function getBounds(center: Coordinates, radiusMiles: number) {
  const latChange = radiusMiles / 69 // Approximate miles per degree of latitude
  const lngChange = radiusMiles / (69 * Math.cos(toRadians(center.lat))) // Adjust for longitude

  return {
    north: center.lat + latChange,
    south: center.lat - latChange,
    east: center.lng + lngChange,
    west: center.lng - lngChange,
  }
}
