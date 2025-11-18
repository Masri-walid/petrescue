"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { NavigationHeader } from '@/components/navigation-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, ArrowLeft, MapPin, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

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
  injuredOrSick: boolean
  injuryDescription?: string
  status: string
  createdAt: string
  updatedAt?: string
  assignedOrganizationName?: string
  assignedOrganization?: {
    id: string
    name: string
    phone?: string
    email?: string
    address?: string
  }
  photos?: Array<{
    id: string
    filePath: string
    fileName: string
  }>
}

export default function MyReportsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<RescueReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'reported':
        return {
          label: 'Pending',
          color: 'secondary',
          icon: Clock,
          description: 'Waiting for rescue organization to respond'
        }
      case 'assigned':
        return {
          label: 'Assigned',
          color: 'default',
          icon: CheckCircle,
          description: 'A rescue organization has claimed this report'
        }
      case 'in_progress':
        return {
          label: 'In Progress',
          color: 'default',
          icon: AlertCircle,
          description: 'Rescue is actively being handled'
        }
      case 'rescued':
        return {
          label: 'Rescued',
          color: 'default',
          icon: CheckCircle,
          description: 'Animal has been successfully rescued'
        }
      case 'closed':
        return {
          label: 'Closed',
          color: 'secondary',
          icon: CheckCircle,
          description: 'Case has been resolved'
        }
      default:
        return {
          label: status,
          color: 'secondary',
          icon: Clock,
          description: 'Status unknown'
        }
    }
  }

  // Handle status updates for claimed reports
  const handleStatusUpdate = async (reportId: string, newStatus: string) => {
    try {
      setUpdatingStatus(reportId)
      const response = await apiClient.updateRescueReportStatus(reportId, newStatus)

      if (response.error) {
        setError(response.error)
      } else {
        // Update the report in the local state
        setReports(prevReports =>
          prevReports.map(report =>
            report.id === reportId
              ? { ...report, status: newStatus, updatedAt: new Date().toISOString() }
              : report
          )
        )
        setError('') // Clear any previous errors
      }
    } catch (err) {
      console.error('Error updating status:', err)
      setError('Failed to update status. Please try again.')
    } finally {
      setUpdatingStatus(null)
    }
  }

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
  }, [isAuthenticated, router])

  // Fetch user's reports
  useEffect(() => {
    const fetchReports = async () => {
      if (!user?.id) return

      try {
        setIsLoading(true)

        // For veterinarians and shelters, get both submitted reports and assigned reports
        if (user.role === 'veterinarian' || user.role === 'shelter') {
          // Get all reports for this user (both submitted and assigned)
          const response = await apiClient.getRescueReports({
            pageSize: 100 // Get more reports to include both submitted and assigned
          })

          if (response.error) {
            setError(response.error)
          } else if (response.data?.reports) {
            // Filter to show reports where user is either reporter or assigned organization member
            const allReports = response.data.reports
            console.log('All reports:', allReports.length)
            console.log('User ID:', user.id)
            console.log('User Organization ID:', user.organizationId)

            const userReports = allReports.filter((report: any) => {
              const isReporter = report.reporterId === user.id
              const isAssignedToOrg = report.assignedOrganizationId && user.organizationId && report.assignedOrganizationId === user.organizationId

              console.log(`Report ${report.id}: isReporter=${isReporter}, isAssignedToOrg=${isAssignedToOrg}, assignedOrgId=${report.assignedOrganizationId}`)

              return isReporter || isAssignedToOrg
            })

            console.log('Filtered user reports:', userReports.length)
            setReports(userReports)
          }
        } else {
          // For regular users, only get their submitted reports
          const response = await apiClient.getUserRescueReports(user.id)

          if (response.error) {
            setError(response.error)
          } else if (response.data) {
            setReports(response.data)
          }
        }
      } catch (error) {
        console.error('Failed to fetch reports:', error)
        setError('Failed to load your reports. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [user])

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'emergency':
      case 'critical':
        return 'bg-red-100 text-red-800 border border-red-300 font-semibold'
      case 'urgent':
        return 'bg-orange-100 text-orange-800'
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Please log in to view your reports.</p>
            <Button asChild className="mt-4">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">My Rescue Reports</h1>
          </div>
          <p className="text-muted-foreground">Track the status of your submitted rescue reports</p>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                <p>{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                    <div className="h-20 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Reports List */}
        {!isLoading && !error && (
          <>
            {reports.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Reports Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't submitted any rescue reports yet. Help animals in need by reporting strays in your area.
                    </p>
                    <Button asChild>
                      <Link href="/rescue">Report a Rescue</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {reports.map((report) => (
                  <Card key={report.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {report.animalType} {report.breed && `- ${report.breed}`}
                            <Badge className={getUrgencyColor(report.urgencyLevel)}>
                              {report.urgencyLevel} Priority
                            </Badge>
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {report.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {(() => {
                            const statusInfo = getStatusInfo(report.status)
                            const StatusIcon = statusInfo.icon
                            return (
                              <>
                                <div className="flex items-center gap-2">
                                  <StatusIcon className="w-4 h-4" />
                                  <Badge variant={statusInfo.color as any}>
                                    {statusInfo.label}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground text-right">
                                  {statusInfo.description}
                                </p>
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {report.description && (
                          <p className="text-sm text-muted-foreground">{report.description}</p>
                        )}
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {report.size && (
                            <div>
                              <span className="font-medium">Size:</span> {report.size}
                            </div>
                          )}
                          {report.color && (
                            <div>
                              <span className="font-medium">Color:</span> {report.color}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Condition:</span> {report.animalCondition}
                          </div>
                          <div>
                            <span className="font-medium">Injured:</span> {report.injuredOrSick ? 'Yes' : 'No'}
                          </div>
                        </div>

                        {report.injuredOrSick && report.injuryDescription && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">
                              <span className="font-medium">Injury Details:</span> {report.injuryDescription}
                            </p>
                          </div>
                        )}

                        {/* Assigned Organization Info */}
                        {(report.assignedOrganization || report.assignedOrganizationName) && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Assigned Organization</h4>
                            <div className="space-y-2 text-sm text-blue-700">
                              <p>
                                <span className="font-medium">Name:</span>{' '}
                                {report.assignedOrganization?.name || report.assignedOrganizationName}
                              </p>
                              {report.assignedOrganization?.phone && (
                                <p>
                                  <span className="font-medium">Phone:</span>{' '}
                                  <a
                                    href={`tel:${report.assignedOrganization.phone}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {report.assignedOrganization.phone}
                                  </a>
                                </p>
                              )}
                              {report.assignedOrganization?.email && (
                                <p>
                                  <span className="font-medium">Email:</span>{' '}
                                  <a
                                    href={`mailto:${report.assignedOrganization.email}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {report.assignedOrganization.email}
                                  </a>
                                </p>
                              )}
                              {report.assignedOrganization?.address && (
                                <p>
                                  <span className="font-medium">Address:</span>{' '}
                                  {report.assignedOrganization.address}
                                </p>
                              )}
                              {report.updatedAt && (
                                <p className="text-xs text-blue-600 mt-2">
                                  Assigned on {new Date(report.updatedAt).toLocaleDateString()} at{' '}
                                  {new Date(report.updatedAt).toLocaleTimeString()}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Status Update Actions for Claimed Reports */}
                        {report.assignedOrganizationId === user.organizationId &&
                         report.status !== 'resolved' &&
                         (user.role === 'veterinarian' || user.role === 'shelter') && (
                          <div className="pt-4 border-t">
                            <div className="flex flex-wrap gap-2">
                              {report.status === 'assigned' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(report.id, 'in_progress')}
                                  disabled={updatingStatus === report.id}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  {updatingStatus === report.id ? 'Starting...' : 'Start Working'}
                                </Button>
                              )}
                              {report.status === 'in_progress' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(report.id, 'resolved')}
                                  disabled={updatingStatus === report.id}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {updatingStatus === report.id ? 'Resolving...' : 'Mark Resolved'}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`/reports/${report.id}`, '_blank')}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
