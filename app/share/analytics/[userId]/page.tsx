import { AnalyticsDashboardClient } from "@/components/analytics/analytics-dashboard-client"
import { getAnalyticsData } from "@/lib/actions/analytics-actions"
import { Card, CardContent } from "@/components/ui/card"
import { LucernaSunIcon } from "@/components/lucerna-sun-icon"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Shared Analytics | Lucerna AI",
  description: "View shared analytics dashboard",
}

async function validateShareToken(userId: string, token: string) {
  // In a real implementation, we would validate the token against the database
  // For now, we'll just return true if the token exists
  return !!token
}

export default async function SharedAnalyticsPage({
  params,
  searchParams,
}: {
  params: { userId: string }
  searchParams: { token?: string; timeRange?: string }
}) {
  const { userId } = params
  const { token, timeRange = "all" } = searchParams

  // Validate the token
  if (!token || !(await validateShareToken(userId, token))) {
    return (
      <div className="container-wide py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <LucernaSunIcon size={48} className="mb-4 opacity-30" />
            <h2 className="text-xl font-medium text-gray-500 mb-2">Invalid or Expired Link</h2>
            <p className="text-gray-400 max-w-md text-center mb-6">
              This shared analytics link is invalid or has expired.
            </p>
            <Button asChild>
              <Link href="/">Go to Homepage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch analytics data
  const analyticsData = await getAnalyticsData(userId, timeRange as any)

  return (
    <div className="container-wide py-12">
      <div className="mb-8 text-center">
        <LucernaSunIcon size={48} glowing={true} className="mx-auto mb-4" />
        <h1 className="text-3xl font-serif mb-2">Shared Analytics Dashboard</h1>
        <p className="text-gray-600">This is a shared view of a Lucerna AI user's analytics dashboard.</p>
      </div>

      <AnalyticsDashboardClient initialData={analyticsData} userId={userId} />

      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500 mb-4">Want to create your own professional resume analytics?</p>
        <Button asChild>
          <Link href="/">Try Lucerna AI</Link>
        </Button>
      </div>
    </div>
  )
}
