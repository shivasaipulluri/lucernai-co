"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { testAIConnections } from "@/lib/test-ai-connection"
import { CheckCircle, XCircle } from "lucide-react"

export default function TestConnectionsPage() {
  const [results, setResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runTests = async () => {
    setIsLoading(true)
    try {
      const testResults = await testAIConnections()
      setResults(testResults)
    } catch (error) {
      console.error("Error running tests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 font-serif">Test AI Connections</h1>
      <p className="mb-6 text-gray-600">This page tests connections to the AI providers used by Lucerna AI.</p>

      <Button onClick={runTests} disabled={isLoading}>
        {isLoading ? "Testing..." : "Run Tests"}
      </Button>

      {results && (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Google Gemini
                {results.gemini.success ? (
                  <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="ml-2 h-5 w-5 text-red-500" />
                )}
              </CardTitle>
              <CardDescription>
                {results.gemini.success ? "Connection successful" : "Connection failed"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto">{results.gemini.message}</pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Mistral AI
                {results.mistral.success ? (
                  <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="ml-2 h-5 w-5 text-red-500" />
                )}
              </CardTitle>
              <CardDescription>
                {results.mistral.success ? "Connection successful" : "Connection failed"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto">{results.mistral.message}</pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
