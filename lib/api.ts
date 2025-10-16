const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    const headers: HeadersInit = {
      ...options.headers,
    }

    // Only set Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json"
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Network error occurred",
      }
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{
      success: boolean
      message: string
      token?: string
      user?: any
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    phone?: string
    role: string
  }) {
    return this.request<{
      success: boolean
      message: string
      token?: string
      user?: any
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async getProfile() {
    return this.request<any>("/auth/profile", {
      method: "GET",
    })
  }

  // Animals endpoints
  async getAnimals(
    params: {
      search?: string
      type?: string
      age?: string
      size?: string
      status?: string
      featured?: boolean
      sortBy?: string
      page?: number
      pageSize?: number
    } = {},
  ) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString())
      }
    })

    return this.request<{
      animals: any[]
      totalCount: number
      page: number
      pageSize: number
      totalPages: number
    }>(`/animals?${searchParams.toString()}`)
  }

  async getAnimal(id: string) {
    return this.request<any>(`/animals/${id}`)
  }

  async createAnimal(animalData: any) {
    return this.request<any>("/animals", {
      method: "POST",
      body: JSON.stringify(animalData),
    })
  }

  // Organizations endpoints
  async getOrganizations(
    params: {
      search?: string
      type?: string
      latitude?: number
      longitude?: number
      radius?: number
      sortBy?: string
    } = {},
  ) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString())
      }
    })

    return this.request<any[]>(`/organizations?${searchParams.toString()}`)
  }

  async getOrganization(id: string) {
    return this.request<any>(`/organizations/${id}`)
  }

  // Rescue reports endpoints
  async createRescueReport(reportData: any, photos?: File[]) {
    // Convert camelCase to PascalCase for backend compatibility
    const backendData = {
      AnimalType: reportData.animalType,
      Breed: reportData.breed,
      Size: reportData.size,
      Color: reportData.color,
      Description: reportData.description,
      Location: reportData.location,
      Latitude: reportData.latitude,
      Longitude: reportData.longitude,
      UrgencyLevel: reportData.urgencyLevel,
      AnimalCondition: reportData.animalCondition,
      InjuredOrSick: reportData.injuredOrSick || false,
      InjuryDescription: reportData.injuryDescription,
      ReporterName: reportData.reporterName,
      ReporterPhone: reportData.reporterPhone,
      ReporterEmail: reportData.reporterEmail
    }

    // If no photos, use JSON endpoint
    if (!photos || photos.length === 0) {
      return this.request<any>("/RescueReports/json", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backendData),
      })
    }

    // Use FormData for photo uploads
    const formData = new FormData()

    // Add all report data fields to FormData (PascalCase)
    Object.keys(backendData).forEach(key => {
      if (backendData[key] !== null && backendData[key] !== undefined) {
        let value = backendData[key]
        // Ensure decimal values are formatted with dot as decimal separator
        if (key === 'Latitude' || key === 'Longitude') {
          value = Number(value).toFixed(8) // Use fixed precision and ensure dot separator
        }
        formData.append(key, value.toString())
      }
    })

    // Add photos
    photos.forEach((photo, index) => {
      formData.append('photos', photo)
    })

    return this.request<any>("/RescueReports", {
      method: "POST",
      body: formData, // Don't set Content-Type header - let browser set it with boundary
    })
  }

  async getRescueReports(
    params: {
      status?: string
      urgency?: string
      organizationId?: string
      reporterId?: string
      sortBy?: string
      page?: number
      pageSize?: number
    } = {},
  ) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString())
      }
    })

    return this.request<{
      reports: any[]
      totalCount: number
      page: number
      pageSize: number
      totalPages: number
    }>(`/RescueReports?${searchParams.toString()}`)
  }

  async getUserRescueReports(userId: string) {
    return this.request<any[]>(`/RescueReports/user/${userId}`)
  }

  async getUnhandledReportsCount() {
    return this.request<{ count: number }>(`/RescueReports/unhandled/count`)
  }

  async claimRescueReport(reportId: string) {
    return this.request<any>(`/RescueReports/${reportId}/assign`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        organizationId: "00000000-0000-0000-0000-000000000000" // Backend will use user's actual organization
      }),
    })
  }

  async updateProfile(profileData: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }) {
    return this.request<any>("/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    })
  }

  // Adoption applications endpoints
  async createAdoptionApplication(applicationData: any) {
    return this.request<any>("/adoptionapplications", {
      method: "POST",
      body: JSON.stringify(applicationData),
    })
  }

  async getAdoptionApplications(
    params: {
      status?: string
      animalId?: number
      organizationId?: number
      sortBy?: string
      page?: number
      pageSize?: number
    } = {},
  ) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString())
      }
    })

    return this.request<{
      applications: any[]
      totalCount: number
      page: number
      pageSize: number
      totalPages: number
    }>(`/adoptionapplications?${searchParams.toString()}`)
  }

  // Image endpoints
  async uploadTemporaryPhoto(file: File) {
    const formData = new FormData()
    formData.append("file", file)

    const headers: HeadersInit = {}
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(`${this.baseURL}/images/upload/temporary`, {
        method: "POST",
        headers,
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Upload failed",
      }
    }
  }

  async getTemporaryImages(sessionId: string) {
    return this.request<any[]>(`/images/temporary/${sessionId}`)
  }

  async moveTemporaryPhotosToRescue(rescueId: number, tempPhotoIds: number[]) {
    return this.request<any[]>(`/images/rescues/${rescueId}/photos/from-temporary`, {
      method: "POST",
      body: JSON.stringify({ tempPhotoIds }),
    })
  }

  async deleteTemporaryPhoto(photoId: string) {
    return this.request<any>(`/images/temporary/${photoId}`, {
      method: "DELETE",
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
export default apiClient
