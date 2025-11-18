"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"

export function DebugAPI() {
  const [result, setResult] = useState<string>("")
  
  const testDirectFetch = async () => {
    try {
      setResult("Testing direct fetch...")
      const response = await fetch("http://localhost:5149/api/animals")
      const data = await response.json()
      setResult(`✅ Direct Fetch Success: Got ${Array.isArray(data) ? data.length : 'unknown'} animals`)
    } catch (error) {
      setResult(`❌ Direct Fetch Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  const testApiClient = async () => {
    try {
      setResult("Testing API client...")
      const response = await apiClient.getAnimals()
      if (response.error) {
        setResult(`❌ API Client Failed: ${response.error} (URL: ${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5149/api"})`)
      } else {
        setResult(`✅ API Client Success: Got ${response.data?.animals?.length || 0} animals (URL: ${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5148/api"})`)
      }
    } catch (error) {
      setResult(`❌ API Client Failed: ${error instanceof Error ? error.message : 'Unknown error'} (URL: ${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5148/api"})`)
    }
  }
  
  const testRegistration = async () => {
    try {
      setResult("Testing registration...")
      const result = await apiClient.register({
        firstName: "Test",
        lastName: "User",
        email: `test${Date.now()}@example.com`,
        password: "password123",
        role: "citizen"
      })
      
      if (result.error) {
        setResult(`❌ Registration Failed: ${result.error}`)
      } else {
        setResult(`✅ Registration Success: ${result.data?.message}`)
      }
    } catch (error) {
      setResult(`❌ Registration Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  return (
    <div className="p-4 bg-muted rounded-lg max-w-md mx-auto">
      <h3 className="font-semibold mb-2">API Debug Panel</h3>
      <div className="text-xs mb-2">
        API URL: {process.env.NEXT_PUBLIC_API_URL || "http://localhost:5149/api"}
      </div>
      <div className="flex gap-2 mb-2 flex-wrap">
        <Button size="sm" onClick={testDirectFetch}>Direct Fetch</Button>
        <Button size="sm" onClick={testApiClient}>API Client</Button>
        <Button size="sm" onClick={testRegistration}>Registration</Button>
      </div>
      {result && (
        <div className="text-sm p-2 bg-background rounded border whitespace-pre-wrap">
          {result}
        </div>
      )}
    </div>
  )
}
