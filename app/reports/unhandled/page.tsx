"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Heart, MapPin, Clock, Phone, Mail, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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
  createdAt: string
  photos?: Array<{
    id: string
    filePath: string
    fileName: string
  }>
}

export default function UnhandledReportsPage() {
  const { user, isAuthenticated } = useAuth()
  const [reports, setReports] = useState<RescueReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [claimingReports, setClaimingReports] = useState<Set<string>>(new Set())

  // Check if user is authorized
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You need to be logged in to access this page.</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (user.role !== 'shelter' && user.role !== 'veterinarian') {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            Only shelters and veterinarians can access unhandled rescue reports.
          </p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchUnhandledReports()
  }, [])

  const fetchUnhandledReports = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getRescueReports({ 
        status: 'reported' // Only get unhandled reports
      })
      
      if (response.error) {
        setError(response.error)
      } else {
        setReports(response.data || [])
      }
    } catch (err) {
      setError('Failed to load rescue reports')
      console.error('Error fetching reports:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClaimReport = async (reportId: string) => {
    try {
      setClaimingReports(prev => new Set(prev).add(reportId))
      
      const response = await apiClient.claimRescueReport(reportId)
      
      if (response.error) {
        setError(`Failed to claim report: ${response.error}`)
      } else {
        // Remove the claimed report from the list
        setReports(prev => prev.filter(report => report.id !== reportId))
        // Show success message
        setError(null)
      }
    } catch (err) {
      setError('Failed to claim rescue report')
      console.error('Error claiming report:', err)
    } finally {
      setClaimingReports(prev => {
        const newSet = new Set(prev)
        newSet.delete(reportId)
        return newSet
      })
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'critical': return 'destructive'
      case 'urgent': return 'destructive'
      case 'moderate': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'injured': return 'destructive'
      case 'sick': return 'destructive'
      case 'good': return 'default'
      case 'unknown': return 'secondary'
      default: return 'secondary'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading rescue reports...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/profile">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">PetRescue Connect</span>
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold">Unhandled Rescue Reports</h1>
            <p className="text-muted-foreground">
              Animals in need waiting for rescue assistance
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Reports List */}
        {reports.length === 0 ? (
          <Card>
            <CardHeader className="text-center">
              <CardTitle>No Unhandled Reports</CardTitle>
              <CardDescription>
                All rescue reports have been claimed or there are no reports at this time.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">Great job! All animals are being cared for.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reports.map((report) => (
              <Card key={report.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {report.animalType}
                        {report.breed && ` - ${report.breed}`}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4" />
                        {report.location}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant={getUrgencyColor(report.urgencyLevel)}>
                        {report.urgencyLevel}
                      </Badge>
                      <Badge variant={getConditionColor(report.animalCondition)}>
                        {report.animalCondition}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Animal Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
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
                  </div>

                  {/* Description */}
                  {report.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                  )}

                  {/* Reporter Contact */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Reporter Contact</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{report.reporterName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${report.reporterPhone}`} className="text-primary hover:underline">
                          {report.reporterPhone}
                        </a>
                      </div>
                      {report.reporterEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${report.reporterEmail}`} className="text-primary hover:underline">
                            {report.reporterEmail}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Reported {new Date(report.createdAt).toLocaleDateString()} at{' '}
                    {new Date(report.createdAt).toLocaleTimeString()}
                  </div>

                  {/* Action Button */}
                  <Button 
                    onClick={() => handleClaimReport(report.id)}
                    disabled={claimingReports.has(report.id)}
                    className="w-full"
                  >
                    {claimingReports.has(report.id) ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Claiming...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Take Responsibility
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
