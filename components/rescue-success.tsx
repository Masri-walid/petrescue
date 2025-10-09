import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, MapPin, Clock, Phone } from "lucide-react"
import Link from "next/link"

interface RescueSuccessProps {
  reportId: string
  estimatedResponse: string
  nearestShelter: string
}

export default function RescueSuccess({ reportId, estimatedResponse, nearestShelter }: RescueSuccessProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Report Submitted Successfully!</CardTitle>
          <CardDescription className="text-green-700">
            Your rescue report has been sent to nearby shelters and volunteers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-white rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Report ID:</span>
              <Badge variant="secondary">{reportId}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Estimated Response:</span>
              <div className="flex items-center gap-1 text-sm">
                <Clock className="w-4 h-4" />
                {estimatedResponse}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Nearest Shelter:</span>
              <div className="flex items-center gap-1 text-sm">
                <MapPin className="w-4 h-4" />
                {nearestShelter}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">What's happening now:</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-sm">Shelters Notified</p>
                  <p className="text-xs text-muted-foreground">3 nearby shelters have been alerted</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-sm">Volunteers Dispatched</p>
                  <p className="text-xs text-muted-foreground">Rescue team is being assembled</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-sm">Rescue in Progress</p>
                  <p className="text-xs text-muted-foreground">You'll receive updates via SMS/email</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/track-rescue">Track This Rescue</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1 bg-transparent">
              <Link href="/rescue">Report Another</Link>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Need immediate help?</p>
            <Button variant="destructive" size="sm">
              <Phone className="w-4 h-4 mr-2" />
              Call Emergency: 1-800-RESCUE
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
