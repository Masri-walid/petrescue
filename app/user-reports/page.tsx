'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, MapPin, Phone, Mail, Calendar, Filter, ArrowLeft, Eye, Camera } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface RescueReport {
  id: string
  reporterId?: string
  animalType: string
  urgencyLevel: string
  animalCondition: string
  description: string
  locationAddress: string
  contactName: string
  contactPhone: string
  contactEmail: string
  status: string
  createdAt: string
  updatedAt: string
  assignedOrganizationId?: string
  rescueDate?: string
  notes?: string
  rescueReportPhotos?: Array<{
    id: string
    fileName: string
    contentType: string
    fileSize: number
    photoUrl?: string
    photoData?: string
  }>
}

interface ReportsResponse {
  reports: RescueReport[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export default function UserReportsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<RescueReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: 'all',
    urgency: 'all',
    search: ''
  })
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Check if user is logged in
  useEffect(() => {
    // Wait for auth to finish loading before redirecting
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
  }, [user, authLoading, router])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search)
    }, 500)

    return () => clearTimeout(timer)
  }, [filters.search])

  // Fetch user's rescue reports
  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!user?.id) {
        setError('User not authenticated')
        return
      }

      console.log('Fetching reports for user ID:', user.id)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: '10',
        reporterId: user.id
      })

      if (filters.status && filters.status !== 'all') params.append('status', filters.status)
      if (filters.urgency && filters.urgency !== 'all') params.append('urgencyLevel', filters.urgency)

      console.log('API Request URL:', `/RescueReports?${params}`)

      const response = await apiClient.request<ReportsResponse>(`/RescueReports?${params}`)

      console.log('API Response:', response)

      if (response.error) {
        setError(response.error)
      } else {
        const fetchedReports = response.data?.reports || []
        console.log('Fetched reports count:', fetchedReports.length)
        console.log('Reports data:', fetchedReports)

        // Additional client-side filtering to ensure we only show reports where reporter_id matches
        const userReports = fetchedReports.filter(report => {
          const matches = report.reporterId === user.id
          console.log(`Report ${report.id}: reporterId=${report.reporterId}, user.id=${user.id}, matches=${matches}`)
          return matches
        })

        console.log('Filtered user reports count:', userReports.length)

        setReports(userReports)
        setTotalCount(userReports.length)
        setTotalPages(Math.ceil(userReports.length / 10))
      }
    } catch (err) {
      console.error('Error fetching reports:', err)
      setError('Failed to load reports. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchReports()
    }
  }, [user, currentPage, filters.status, filters.urgency, debouncedSearch])

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'destructive'
      case 'assigned': return 'secondary'
      case 'in_progress': return 'default'
      case 'resolved': return 'outline'
      default: return 'secondary'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'emergency':
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'secondary'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If not loading and no user, the useEffect will redirect to login
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Profile
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Rescue Reports</h1>
                <p className="text-gray-600">View your submitted rescue reports</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button variant="outline" size="sm" className="bg-transparent">
                  Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Urgency</label>
                <Select value={filters.urgency} onValueChange={(value) => setFilters({...filters, urgency: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Urgency Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Urgency Levels</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading your reports...</p>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Reports</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchReports}>Try Again</Button>
            </CardContent>
          </Card>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Found</h3>
              <p className="text-gray-600 mb-4">You haven't submitted any rescue reports yet.</p>
              <Link href="/rescue">
                <Button>Submit Your First Report</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    {/* Photo Thumbnail */}
                    {report.rescueReportPhotos && report.rescueReportPhotos.length > 0 && (
                      <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {report.rescueReportPhotos[0].photoData ? (
                          <img
                            src={`data:${report.rescueReportPhotos[0].contentType};base64,${report.rescueReportPhotos[0].photoData}`}
                            alt="Report photo"
                            className="w-full h-full object-cover"
                          />
                        ) : report.rescueReportPhotos[0].photoUrl ? (
                          <img
                            src={report.rescueReportPhotos[0].photoUrl}
                            alt="Report photo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Camera className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getUrgencyColor(report.urgencyLevel) as any}>
                          {report.urgencyLevel} Priority
                        </Badge>
                        <Badge variant={getStatusColor(report.status) as any}>
                          {report.status}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {report.animalType} Rescue Report
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Submitted on {formatDate(report.createdAt)}
                      </p>
                    </div>

                    <Link href={`/reports/${report.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{report.locationAddress}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{report.contactPhone}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-700">
                      <strong>Condition:</strong> {report.animalCondition}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>Description:</strong> {report.description}
                    </p>
                  </div>

                  {report.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Notes:</strong> {report.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} ({totalCount} total reports)
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
