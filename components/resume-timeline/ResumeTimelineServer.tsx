"use server"

import { getResumeTimeline } from "@/lib/actions/timeline-actions"
import { createClient } from "@/lib/supabase/server"
import ResumeTimeline from "./ResumeTimeline"

export default async function ResumeTimelineServer() {
  const supabase = await createClient() // ✅ Added await here

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error("❌ Supabase auth error:", error)
    return <div className="text-center text-destructive mt-12">Authentication failed.</div>
  }

  if (!user) {
    return <div className="text-center text-muted-foreground mt-12">Not authenticated.</div>
  }

  const versions = await getResumeTimeline(user.id)

  return <ResumeTimeline versions={versions} />
}
