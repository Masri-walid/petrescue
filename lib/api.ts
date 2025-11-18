const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5149/api"

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
      // Check both localStorage and sessionStorage for token
      this.token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
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
      sessionStorage.removeItem("auth_token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    }

    // Only set Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json"
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
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
    address?: string
    city?: string
    state?: string
    zipCode?: string
  }) {
    // Convert frontend 'role' to backend 'UserType'
    const backendData = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      userType: userData.role, // Map role to userType
      address: userData.address,
      city: userData.city,
      state: userData.state,
      zipCode: userData.zipCode,
    }

    return this.request<{
      success: boolean
      message: string
      token?: string
      user?: any
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(backendData),
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
      organizationId?: string
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
    // Convert frontend field names to backend field names (camelCase)
    const backendData = {
      animalType: reportData.animalType,
      urgencyLevel: reportData.urgencyLevel || reportData.urgency,
      animalCondition: reportData.animalCondition || reportData.condition,
      locationAddress: reportData.locationAddress || reportData.location,
      description: reportData.description,
      contactName: reportData.contactName || reportData.reporterName,
      contactPhone: reportData.contactPhone || reportData.reporterPhone,
      contactEmail: reportData.contactEmail || reportData.reporterEmail,
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

    // Add all report data fields to FormData (camelCase)
    Object.keys(backendData).forEach(key => {
      if (backendData[key] !== null && backendData[key] !== undefined) {
        let value = backendData[key]
        formData.append(key, value.toString())
      }
    })

    // Add photos
    photos.forEach((photo) => {
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
        organizationId: "00000000-0000-0000-0000-000000000000" // Backend will auto-assign based on user's organization
      }),
    })
  }

  async updateRescueReportStatus(reportId: string, status: string) {
    return this.request<any>(`/RescueReports/${reportId}/status`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: status
      }),
    })
  }

  async updateProfile(profileData: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    profileImageUrl?: string
  }) {
    return this.request<any>("/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    })
  }

  // User Photos endpoints
  async getUserPhotos(userId?: string) {
    const params = userId ? `?userId=${userId}` : ''
    return this.request<any>(`/userphotos${params}`)
  }

  async createUserPhoto(data: { photoUrl: string; caption?: string; isPrimary?: boolean }) {
    return this.request<any>('/userphotos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  }

  async updateUserPhoto(id: string, data: { caption?: string; isPrimary?: boolean }) {
    return this.request<any>(`/userphotos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  }

  async deleteUserPhoto(id: string) {
    return this.request<any>(`/userphotos/${id}`, {
      method: 'DELETE',
    })
  }

  // Favorites endpoints
  async getFavorites() {
    return this.request<any>('/favorites')
  }

  async addToFavorites(animalId: string) {
    return this.request<any>(`/favorites/${animalId}`, {
      method: 'POST',
    })
  }

  async removeFromFavorites(animalId: string) {
    return this.request<any>(`/favorites/${animalId}`, {
      method: 'DELETE',
    })
  }

  async checkFavoriteStatus(animalId: string) {
    return this.request<any>(`/favorites/check/${animalId}`)
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
  async uploadProfileImage(file: File) {
    const formData = new FormData()
    formData.append("file", file)

    const headers: HeadersInit = {}
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(`${this.baseURL}/images/upload/profile`, {
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

  async uploadUserPhoto(file: File, caption?: string, isPrimary?: boolean) {
    const formData = new FormData()
    formData.append("file", file)
    if (caption) formData.append("caption", caption)
    if (isPrimary !== undefined) formData.append("isPrimary", isPrimary.toString())

    const headers: HeadersInit = {}
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(`${this.baseURL}/images/upload/user-photo`, {
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

  async uploadAnimalPhoto(file: File, animalId: string, caption?: string, isPrimary?: boolean, displayOrder?: number) {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("animalId", animalId)
    if (caption) formData.append("caption", caption)
    if (isPrimary !== undefined) formData.append("isPrimary", isPrimary.toString())
    if (displayOrder !== undefined) formData.append("displayOrder", displayOrder.toString())

    const headers: HeadersInit = {}
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(`${this.baseURL}/images/upload/animal-photo`, {
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

  // Organization registration (public endpoint)
  async registerOrganization(organizationData: any) {
    return this.request<{
      success: boolean
      message: string
      data?: any
    }>("/organizations/register", {
      method: "POST",
      body: JSON.stringify(organizationData),
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
export default apiClient
