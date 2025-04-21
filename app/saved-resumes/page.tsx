import { getSavedResumes } from "@/lib/actions/saved-resume-actions"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SavedResumesClient from "@/components/saved-resumes/SavedResumesClient"

export default async function SavedResumesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth")

  const resumes = await getSavedResumes(user.id)

  return <SavedResumesClient resumes={resumes} />
}
