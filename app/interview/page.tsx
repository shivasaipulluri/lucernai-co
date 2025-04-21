import { createClient } from "@/lib/supabase/server"
import { InterviewCoachClient } from "@/components/interview/interview-coach-client"
import { redirect } from "next/navigation"
import { getRecentInterviewSessions } from "@/lib/actions/interview-actions"

export const metadata = {
  title: "Interview Coach | Lucerna AI",
  description: "Practice for your job interviews with AI-generated questions",
}

export default async function InterviewPage({
  searchParams,
}: {
  searchParams: { sessionId?: string }
}) {
  // Check if user is authenticated
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  // Await searchParams to ensure it's fully resolved
  const params = await searchParams;

  // Get the resumeId and jobDescription from the query parameters
  const sessionId = params.sessionId;
  

  // Get recent interview sessions
  const recentSessionsResult = await getRecentInterviewSessions(5)
  const recentSessions = recentSessionsResult.success ? recentSessionsResult.data : []

  return <InterviewCoachClient initialSessionId={sessionId} recentSessions={recentSessions} />
}
