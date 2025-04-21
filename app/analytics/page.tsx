import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AnalyticsDashboardClient } from "@/components/analytics/analytics-dashboard-client"
import { getAnalyticsData } from "@/lib/actions/analytics-actions"

export const metadata = {
  title: "Analytics Dashboard | Lucerna AI",
  description: "Track your resume performance and optimization metrics",
}

export default async function AnalyticsPage() {
  // Check if user is authenticated
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  // Fetch analytics data
  const analyticsData = await getAnalyticsData(user.id)

  return <AnalyticsDashboardClient initialData={analyticsData} userId={user.id} />
}
