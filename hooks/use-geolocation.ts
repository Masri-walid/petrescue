"use client"

import { useState, useEffect } from "react"

interface GeolocationState {
  coordinates: { lat: number; lng: number } | null
  error: string | null
  loading: boolean
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

export function useGeolocation(options: GeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        coordinates: null,
        error: "Geolocation is not supported by this browser",
        loading: false,
      })
      return
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setState({
        coordinates: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        error: null,
        loading: false,
      })
    }

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = "An unknown error occurred"

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location access denied by user"
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information is unavailable"
          break
        case error.TIMEOUT:
          errorMessage = "Location request timed out"
          break
      }

      setState({
        coordinates: null,
        error: errorMessage,
        loading: false,
      })
    }

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: options.enableHighAccuracy ?? true,
      timeout: options.timeout ?? 10000,
      maximumAge: options.maximumAge ?? 300000, // 5 minutes
    })

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [options.enableHighAccuracy, options.timeout, options.maximumAge])

  const getCurrentPosition = () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          error: null,
          loading: false,
        })
      },
      (error) => {
        let errorMessage = "An unknown error occurred"

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable"
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out"
            break
        }

        setState({
          coordinates: null,
          error: errorMessage,
          loading: false,
        })
      },
      {
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 10000,
        maximumAge: options.maximumAge ?? 300000,
      },
    )
  }

  return {
    ...state,
    getCurrentPosition,
  }
}
