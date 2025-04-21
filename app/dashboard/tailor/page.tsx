import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TailoringSettingsClient } from "@/components/dashboard/tailoring-settings-client"
import { getPreferredTailoringMode } from "@/lib/actions/user-preferences-actions"
import { TAILORING_MODES } from "@/utils/ai/compile-tailoring-prompt"

export const metadata = {
  title: "Tailoring Settings | Lucerna AI",
  description: "Customize your resume tailoring preferences",
}

export default async function TailoringSettingsPage() {
  // Check if user is authenticated
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  // Get the user's preferred tailoring mode
  const preferredMode = await getPreferredTailoringMode()

  return <TailoringSettingsClient initialMode={preferredMode || "personalized"} tailoringModes={TAILORING_MODES} />
}
