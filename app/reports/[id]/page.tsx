'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, MapPin, Phone, Mail, Calendar, AlertTriangle, Clock, CheckCircle, Edit } from 'lucide-react'
import Link from 'next/link'

interface RescueReport {
  id: string
  animalType: string
  breed?: string
  size?: string
  color?: string
  description?: string
  locationAddress: string
  coordinates?: string
  urgencyLevel: string
  animalCondition: string
  contactName: string
  contactPhone: string
  contactEmail: string
  status: string
  createdAt: string
  assignedOrganizationId?: string
  assignedOrganization?: {
    id: string
    name: string
    email: string
    phone: string
    organizationType: string
  }
  rescueReportPhotos: Array<{
    id: string
    fileName: string
    contentType: string
    fileSize: number
    photoUrl?: string
    photoData?: string
  }>
}

export default function ReportDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [report, setReport] = useState<RescueReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)

  const reportId = params.id as string

  // Check if current user can update the status of this report
  const canUpdateStatus = () => {
    if (!user || !report) return false
    if (user.role !== 'veterinarian' && user.role !== 'shelter') return false
    return report.assignedOrganizationId === user.organizationId
  }

  // Check if user has access to this page
  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    if (user.role !== 'veterinarian' && user.role !== 'shelter') {
      router.push('/')
      return
    }
  }, [user, router])

  // Fetch report details
  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) return

      try {
        setLoading(true)
        setError(null)
        
        const response = await apiClient.request<RescueReport>(`/RescueReports/${reportId}`)
        
        if (response.error) {
          setError(response.error)
        } else {
          setReport(response.data || null)
        }
      } catch (err) {
        console.error('Error fetching report:', err)
        setError('Failed to load report details. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [reportId])

  const handleClaimReport = async () => {
    if (!report) return

    try {
      setClaiming(true)
      const response = await apiClient.claimRescueReport(report.id)
      if (response.error) {
        setError(response.error)
      } else {
        // Refresh the report data
        const updatedResponse = await apiClient.request<RescueReport>(`/RescueReports/${reportId}`)
        if (updatedResponse.data) {
          setReport(updatedResponse.data)
        }
      }
    } catch (err) {
      console.error('Error claiming report:', err)
      setError('Failed to claim report. Please try again.')
    } finally {
      setClaiming(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!report) return

    try {
      setUpdatingStatus(true)
      const response = await apiClient.updateRescueReportStatus(report.id, newStatus)
      if (response.error) {
        setError(response.error)
      } else {
        // Refresh the report data
        const updatedResponse = await apiClient.request<RescueReport>(`/RescueReports/${reportId}`)
        if (updatedResponse.data) {
          setReport(updatedResponse.data)
          setShowStatusUpdate(false)
        }
      }
    } catch (err) {
      console.error('Error updating status:', err)
      setError('Failed to update status. You may not have permission to update this report.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'emergency':
      case 'critical':
        return <Badge variant="destructive" className="flex items-center gap-1 badge-emergency">
          <AlertTriangle className="h-3 w-3" />
          {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
        </Badge>
      case 'high':
        return <Badge variant="destructive" className="bg-orange-500">High</Badge>
      case 'moderate':
        return <Badge variant="secondary">Moderate</Badge>
      case 'low':
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge variant="secondary">{urgency}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'reported':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Reported
        </Badge>
      case 'assigned':
        return <Badge variant="default">Assigned</Badge>
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-500">In Progress</Badge>
      case 'rescued':
        return <Badge variant="default" className="bg-green-500 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Rescued
        </Badge>
      case 'closed':
        return <Badge variant="outline">Closed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (!user || (user.role !== 'veterinarian' && user.role !== 'shelter')) {
    return null // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading report details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/notifications">
            <Button>Back to Notifications</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Report Not Found</h1>
          <p className="text-muted-foreground mb-4">The requested report could not be found.</p>
          <Link href="/notifications">
            <Button>Back to Notifications</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/notifications">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Notifications
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Rescue Report Details
            </h1>
            <p className="text-gray-600">
              Report ID: {report.id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getUrgencyBadge(report.urgencyLevel)}
            {getStatusBadge(report.status)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Animal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Animal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">
                {report.animalType.charAt(0).toUpperCase() + report.animalType.slice(1)}
                {report.breed && ` - ${report.breed}`}
              </h3>
            </div>
            
            {report.description && (
              <div>
                <span className="font-medium">Description:</span>
                <p className="text-gray-700 mt-1">{report.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              {report.size && (
                <div>
                  <span className="font-medium">Size:</span>
                  <p className="text-gray-700">{report.size}</p>
                </div>
              )}
              {report.color && (
                <div>
                  <span className="font-medium">Color:</span>
                  <p className="text-gray-700">{report.color}</p>
                </div>
              )}
            </div>
            
            <div>
              <span className="font-medium">Condition:</span>
              <p className="text-gray-700">{report.animalCondition}</p>
            </div>
            
            {report.injuredOrSick && report.injuryDescription && (
              <div>
                <span className="font-medium">Injury Description:</span>
                <p className="text-gray-700">{report.injuryDescription}</p>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              {report.locationAddress}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              Reported on {new Date(report.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        {/* Reporter Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Reporter Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="font-medium">Name:</span>
              <p className="text-gray-700">{report.contactName}</p>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span className="font-medium">Phone:</span>
              <p className="text-gray-700">{report.contactPhone}</p>
            </div>

            {report.contactEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="font-medium">Email:</span>
                <p className="text-gray-700">{report.contactEmail}</p>
              </div>
            )}
            
            {report.assignedOrganization && (
              <div>
                <span className="font-medium">Assigned to:</span>
                <p className="text-gray-700">{report.assignedOrganization.name}</p>
                <p className="text-sm text-gray-600 mt-1">
                  📧 {report.assignedOrganization.email}
                </p>
                <p className="text-sm text-gray-600">
                  📞 {report.assignedOrganization.phone}
                </p>
                <p className="text-sm text-gray-600">
                  🏢 {report.assignedOrganization.organizationType}
                </p>
              </div>
            )}
            
            {report.status === 'reported' && user && (user.role === 'veterinarian' || user.role === 'shelter') && (
              <Button
                onClick={handleClaimReport}
                disabled={claiming}
                className="w-full mt-4"
              >
                {claiming ? 'Claiming...' : 'Claim Report'}
              </Button>
            )}

            {/* Status Update Section - Only for organizations that claimed the report */}
            {canUpdateStatus() && report.status !== 'reported' && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Update Status:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowStatusUpdate(!showStatusUpdate)}
                    disabled={updatingStatus}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {showStatusUpdate ? 'Cancel' : 'Change Status'}
                  </Button>
                </div>

                {showStatusUpdate && (
                  <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                    <Select onValueChange={handleStatusUpdate} disabled={updatingStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="rescued">Rescued</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    {updatingStatus && (
                      <p className="text-sm text-gray-600">Updating status...</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Photos */}
      {report.rescueReportPhotos && report.rescueReportPhotos.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Photos ({report.rescueReportPhotos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {report.rescueReportPhotos.map((photo) => (
                <div key={photo.id} className="aspect-square bg-muted rounded-lg overflow-hidden">
                  {photo.photoData ? (
                    <img
                      src={`data:${photo.contentType};base64,${photo.photoData}`}
                      alt={photo.fileName || 'Rescue photo'}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => {
                        const newWindow = window.open();
                        if (newWindow) {
                          newWindow.document.write(`<img src="data:${photo.contentType};base64,${photo.photoData}" style="max-width:100%;height:auto;" />`);
                        }
                      }}
                    />
                  ) : photo.photoUrl ? (
                    <img
                      src={photo.photoUrl}
                      alt={photo.fileName || 'Rescue photo'}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(photo.photoUrl, '_blank')}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
