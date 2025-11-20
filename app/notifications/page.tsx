'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, MapPin, Phone, Mail, Calendar, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { NavigationHeader } from '@/components/navigation-header'

interface RescueReport {
  id: string
  animalType: string
  breed?: string
  size?: string
  color?: string
  description?: string
  location: string
  urgencyLevel: string
  animalCondition: string
  reporterName: string
  reporterPhone: string
  reporterEmail?: string
  status: string
  assignedOrganizationId?: string
  assignedOrganizationName?: string
  assignedOrganizationEmail?: string
  createdAt: string
  photos: Array<{
    id: string
    fileName: string
    photoUrl: string
  }>
}

interface ReportsResponse {
  reports: RescueReport[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<RescueReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: 'all',
    urgency: 'all',
    search: '',
    showOnlyClaimed: false // New filter for claimed reports
  })
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  // Check if user has access to this page
  useEffect(() => {
    // Wait for auth to finish loading before redirecting
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (!authLoading && user && user.role !== 'veterinarian' && user.role !== 'shelter') {
      router.push('/')
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

  // Fetch rescue reports
  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: '10'
      })

      if (filters.status && filters.status !== 'all') params.append('status', filters.status)
      if (filters.urgency && filters.urgency !== 'all') params.append('urgencyLevel', filters.urgency)

      // Filter by organization if "show only claimed" is enabled
      if (filters.showOnlyClaimed && user?.organizationId) {
        params.append('organizationId', user.organizationId)
      }

      const response = await apiClient.request<ReportsResponse>(`/RescueReports?${params}`)

      if (response.error) {
        setError(response.error)
      } else {
        setReports(response.data?.reports || [])
        setTotalCount(response.data?.totalCount || 0)
        setTotalPages(response.data?.totalPages || 1)
      }
    } catch (err) {
      console.error('Error fetching reports:', err)
      setError('Failed to load rescue reports. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && (user.role === 'veterinarian' || user.role === 'shelter')) {
      fetchReports()
    }
  }, [user, currentPage, filters.status, filters.urgency, filters.showOnlyClaimed, debouncedSearch])

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'emergency':
      case 'critical': return 'bg-red-600 border-red-700 shadow-lg'
      case 'high': return 'bg-orange-500'
      case 'moderate': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'reported': return 'bg-blue-500'
      case 'assigned': return 'bg-purple-500'
      case 'in_progress': return 'bg-orange-500'
      case 'rescued': return 'bg-green-500'
      case 'closed': return 'bg-gray-500'
      default: return 'bg-gray-500'
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

  const handleClaimReport = async (reportId: string) => {
    try {
      const response = await apiClient.claimRescueReport(reportId)
      if (response.error) {
        setError(response.error)
      } else {
        // Refresh the reports list
        fetchReports()
      }
    } catch (err) {
      console.error('Error claiming report:', err)
      setError('Failed to claim report. Please try again.')
    }
  }

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    try {
      setUpdatingStatus(reportId)
      const response = await apiClient.updateRescueReportStatus(reportId, newStatus)
      if (response.error) {
        setError(response.error)
      } else {
        // Refresh the reports list
        fetchReports()
      }
    } catch (err) {
      console.error('Error updating status:', err)
      setError('Failed to update status. Please try again.')
    } finally {
      setUpdatingStatus(null)
    }
  }

  // Check if current user's organization owns this report
  const canUpdateStatus = (report: RescueReport) => {
    return report.assignedOrganizationId === user?.organizationId
  }

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // If not loading and no user or wrong role, the useEffect will redirect
  if (!user || (user.role !== 'veterinarian' && user.role !== 'shelter')) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rescue Reports Dashboard
          </h1>
          <p className="text-gray-600">
            View and manage rescue reports in your area
          </p>
        </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Toggle for claimed reports */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <input
                type="checkbox"
                id="showOnlyClaimed"
                checked={filters.showOnlyClaimed}
                onChange={(e) => setFilters(prev => ({ ...prev, showOnlyClaimed: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="showOnlyClaimed" className="text-sm font-medium text-blue-900 cursor-pointer">
                Show only my claimed reports
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Urgency</label>
                <Select value={filters.urgency} onValueChange={(value) => setFilters(prev => ({ ...prev, urgency: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All urgency levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All urgency levels</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <Input
                  placeholder="Search by animal type, location..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
            <div className="text-sm text-gray-600">Total Reports</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {reports.filter(r => r.status === 'reported').length}
            </div>
            <div className="text-sm text-gray-600">Unassigned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {reports.filter(r => r.urgencyLevel === 'critical').length}
            </div>
            <div className="text-sm text-gray-600">Critical</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {reports.filter(r => r.status === 'resolved').length}
            </div>
            <div className="text-sm text-gray-600">Resolved</div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading rescue reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">No rescue reports found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Link key={report.id} href={`/reports/${report.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Badge className={`${getUrgencyColor(report.urgencyLevel)} text-white`}>
                      {report.urgencyLevel.toUpperCase()}
                    </Badge>
                    <Badge className={`${getStatusColor(report.status)} text-white`}>
                      {report.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {formatDate(report.createdAt)}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      {report.animalType.charAt(0).toUpperCase() + report.animalType.slice(1)}
                      {report.breed && ` - ${report.breed}`}
                    </h3>
                    
                    {report.description && (
                      <p className="text-gray-700 mb-3">{report.description}</p>
                    )}
                    
                    <div className="space-y-2">
                      {report.size && (
                        <div className="text-sm">
                          <span className="font-medium">Size:</span> {report.size}
                        </div>
                      )}
                      {report.color && (
                        <div className="text-sm">
                          <span className="font-medium">Color:</span> {report.color}
                        </div>
                      )}
                      <div className="text-sm">
                        <span className="font-medium">Condition:</span> {report.animalCondition}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {report.location}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Reporter Contact</h4>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Name:</span> {report.reporterName}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4" />
                        {report.reporterPhone}
                      </div>
                      {report.reporterEmail && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4" />
                          {report.reporterEmail}
                        </div>
                      )}
                    </div>

                    {report.assignedOrganizationName && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-3">Assigned Organization</h4>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Name:</span> {report.assignedOrganizationName}
                          </div>
                          {report.assignedOrganizationEmail && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4" />
                              {report.assignedOrganizationEmail}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="mt-4 space-y-2">
                      {report.status === 'pending' && !report.assignedOrganizationId && (
                        <Button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleClaimReport(report.id)
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          Claim Report
                        </Button>
                      )}

                      {/* Status change for claimed reports */}
                      {canUpdateStatus(report) && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium">Update Status</label>
                          <Select
                            value={report.status}
                            onValueChange={(newStatus) => {
                              handleStatusChange(report.id, newStatus)
                            }}
                            disabled={updatingStatus === report.id}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="assigned">Assigned</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                          {updatingStatus === report.id && (
                            <p className="text-xs text-gray-500">Updating...</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {report.photos && report.photos.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Photos ({report.photos.length})</h4>
                    <div className="flex gap-2 overflow-x-auto">
                      {report.photos.map((photo) => (
                        <img
                          key={photo.id}
                          src={photo.photoUrl}
                          alt={photo.fileName}
                          className="h-20 w-20 object-cover rounded border flex-shrink-0"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
      </div>
    </div>
  )
}
