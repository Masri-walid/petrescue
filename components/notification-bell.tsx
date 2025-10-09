"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, AlertTriangle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className = "" }: NotificationBellProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [unhandledCount, setUnhandledCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [recentReports, setRecentReports] = useState<any[]>([])

  // Only show for veterinarians and shelters
  if (!user || (user.role !== 'veterinarian' && user.role !== 'shelter')) {
    return null
  }

  useEffect(() => {
    fetchUnhandledCount()
    // Set up polling for real-time updates
    const interval = setInterval(fetchUnhandledCount, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchUnhandledCount = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getRescueReports({ 
        status: 'reported',
        pageSize: 5 // Get recent 5 for dropdown preview
      })
      
      if (!response.error && response.data) {
        const reports = Array.isArray(response.data) ? response.data : response.data.reports || []
        setUnhandledCount(reports.length)
        setRecentReports(reports.slice(0, 3)) // Show top 3 in dropdown
      }
    } catch (error) {
      console.error('Error fetching unhandled reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewAllReports = () => {
    router.push('/reports/unhandled')
  }

  const handleReportClick = (reportId: string) => {
    router.push(`/reports/unhandled#${reportId}`)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative ${className}`}
          disabled={loading}
        >
          <Bell className="h-5 w-5" />
          {unhandledCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unhandledCount > 99 ? '99+' : unhandledCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Rescue Notifications</span>
          {unhandledCount > 0 && (
            <Badge variant="secondary">{unhandledCount} unhandled</Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {unhandledCount === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No unhandled reports</p>
            <p className="text-xs">All animals are being cared for!</p>
          </div>
        ) : (
          <>
            {recentReports.map((report) => (
              <DropdownMenuItem
                key={report.id}
                className="flex flex-col items-start p-3 cursor-pointer"
                onClick={() => handleReportClick(report.id)}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">
                        {report.animalType} {report.breed && `- ${report.breed}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {report.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge 
                      variant={report.urgencyLevel === 'critical' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {report.urgencyLevel}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(report.createdAt)}
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center justify-center font-medium text-primary"
              onClick={handleViewAllReports}
            >
              View All {unhandledCount} Reports
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
