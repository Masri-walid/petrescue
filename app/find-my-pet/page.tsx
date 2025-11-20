"use client"

import { useState } from "react"
import { NavigationHeader } from "@/components/navigation-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, ImageIcon, PawPrint, Search } from "lucide-react"
import { apiClient } from "@/lib/api"

interface SimilarityMatch {
  type: "rescue_report" | "animal"
  rescue_report_id?: string
  animal_id?: string
  photo_id: string
  similarity_score: number
  // Rescue report fields
  animal_type?: string
  location?: string
  description?: string
  urgency_level?: string
  status?: string
  // Animal fields
  name?: string
  species?: string
  color?: string
  organization_name?: string
}

interface CompareResponse {
  matches: SimilarityMatch[]
  total_compared: number
  matches_found: number
  rescue_photos_compared?: number
  animal_photos_compared?: number
}

export default function FindMyPetPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<SimilarityMatch[]>([])
  const [summary, setSummary] = useState<{
    total_compared: number
    matches_found: number
    rescue_photos_compared?: number
    animal_photos_compared?: number
  } | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setSelectedFile(file || null)
    setResults([])
    setSummary(null)
    setError(null)

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setPreviewUrl(null)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!selectedFile) {
      setError("Please choose a photo of your pet to search.")
      return
    }

    setIsLoading(true)
    setError(null)

    const response = await apiClient.comparePhoto(selectedFile)

    if (response.error) {
      setError(response.error)
      setResults([])
      setSummary(null)
    } else if (response.data) {
      const data = response.data as CompareResponse
      setResults(data.matches || [])
      setSummary({
        total_compared: data.total_compared ?? 0,
        matches_found: data.matches_found ?? (data.matches?.length ?? 0),
        rescue_photos_compared: data.rescue_photos_compared,
        animal_photos_compared: data.animal_photos_compared,
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <Badge variant="secondary" className="inline-flex items-center gap-1">
              <PawPrint className="w-4 h-4" />
              Find My Pet
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Upload a photo to search for your missing pet
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your photo will be compared against rescue report photos and adoptable animals in shelters.
              Any matches with a similarity score of 70% or higher will appear below.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                Upload pet photo
              </CardTitle>
              <CardDescription>
                For best results, use a clear photo where your pet is centered and well-lit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-1 space-y-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF up to 10MB.
                    </p>
                    {error && (
                      <div className="flex items-start gap-2 text-red-600 text-sm">
                        <AlertTriangle className="w-4 h-4 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>

                  {previewUrl && (
                    <div className="w-40 h-40 rounded-lg border bg-muted overflow-hidden flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewUrl} alt="Selected pet" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <Button type="submit" disabled={!selectedFile || isLoading}>
                    {isLoading ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Find My Pet
                      </>
                    )}
                  </Button>

                  {summary && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>
                        Compared against <span className="font-medium">{summary.total_compared}</span> photos
                        {typeof summary.rescue_photos_compared === "number" &&
                          typeof summary.animal_photos_compared === "number" && (
                            <>
                              {" "}(
                              {summary.rescue_photos_compared} rescue reports, {summary.animal_photos_compared} animals)
                            </>
                          )}
                        .
                      </div>
                      <div>
                        Found <span className="font-medium">{summary.matches_found}</span> potential matches.
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Search className="w-5 h-5" />
                Results
              </h2>
            </div>

            {results.length === 0 && !isLoading && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground space-y-3">
                  <p>No matches yet.</p>
                  <p className="text-sm">
                    Upload a clear photo of your pet and we&apos;ll check recent rescue reports and shelter animals
                    for possible matches.
                  </p>
                </CardContent>
              </Card>
            )}

            {results.length > 0 && (
              <div className="space-y-4">
                {results.map((match, index) => {
                  const similarityPercent = Math.round(match.similarity_score * 100)
                  const isRescue = match.type === "rescue_report"

                  return (
                    <Card key={`${match.type}-${match.photo_id}-${index}`}>
                      <CardContent className="py-4 flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-2">
                          <Badge variant={isRescue ? "outline" : "secondary"}>
                            {isRescue ? "Rescue report" : "Adoptable animal"}
                          </Badge>

                          {isRescue ? (
                            <div className="space-y-1">
                              <p className="font-medium">
                                {match.animal_type || "Animal"} reported
                              </p>
                              {match.location && (
                                <p className="text-sm text-muted-foreground">Location: {match.location}</p>
                              )}
                              {match.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {match.description}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="font-medium">
                                {match.name || "Unnamed"} ({match.species || "Pet"})
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {match.color && <span className="mr-2">Color: {match.color}</span>}
                                {match.organization_name && <span>At: {match.organization_name}</span>}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2 min-w-[140px]">
                          <span className="text-xs text-muted-foreground">Similarity</span>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-semibold">{similarityPercent}%</span>
                          </div>
                          <Progress value={similarityPercent} className="w-32" />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

