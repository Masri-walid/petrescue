/**
 * Utility functions for handling profile image URLs consistently across the application
 */

// Use the same NEXT_PUBLIC_API_URL as the API client, but strip any trailing "/api"
// so that we can safely prefix relative paths like "/api/images/..." without duplicating it.
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5149/api'
const BACKEND_URL = RAW_API_URL.replace(/\/api\/?$/, '')

/**
 * Converts a profile image URL to a full URL that can be used in img src attributes
 * @param profileImageUrl - The profile image URL from the API
 * @returns A full URL or undefined if no image is available
 */
export function getProfileImageUrl(profileImageUrl?: string | null): string | undefined {
  if (!profileImageUrl) return undefined

  // If it's already a full URL (external image), return as is
  if (profileImageUrl.startsWith('http://') || profileImageUrl.startsWith('https://')) {
    return profileImageUrl
  }

  // If it's a relative URL starting with /api (binary data endpoint), prepend the backend URL
  if (profileImageUrl.startsWith('/api/')) {
    return `${BACKEND_URL}${profileImageUrl}`
  }

  // For any other relative URLs, prepend the backend URL
  if (profileImageUrl.startsWith('/')) {
    return `${BACKEND_URL}${profileImageUrl}`
  }

  // If it doesn't start with / or http, assume it's a relative path and prepend backend URL
  return `${BACKEND_URL}/${profileImageUrl}`
}

/**
 * Gets the initials for a user's name to use as a fallback in avatars
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns A string with the user's initials (e.g., "JD" for John Doe)
 */
export function getUserInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0)?.toUpperCase() || ''
  const last = lastName?.charAt(0)?.toUpperCase() || ''
  return `${first}${last}` || '?'
}

/**
 * Checks if a profile image URL represents binary data stored in the database
 * @param profileImageUrl - The profile image URL from the API
 * @returns True if the URL points to binary data endpoint
 */
export function isProfileImageBinary(profileImageUrl?: string | null): boolean {
  return profileImageUrl?.includes('/api/images/profile/') === true
}

/**
 * Gets a user's display name
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns A formatted display name
 */
export function getUserDisplayName(firstName?: string, lastName?: string): string {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  }
  if (firstName) {
    return firstName
  }
  if (lastName) {
    return lastName
  }
  return 'Unknown User'
}
