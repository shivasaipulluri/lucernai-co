import { createClient } from "@/lib/supabase/server"
import { TemplateGalleryClient } from "@/components/templates/template-gallery-client"
import { getUserTemplate, isUserPremium } from "@/lib/actions/template-actions"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Resume Templates | Lucerna AI",
  description: "Browse and select from our collection of ATS-friendly resume templates",
}

export default async function TemplatesPage() {
  // Check if user is authenticated
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  // Get the user's current template and premium status
  const currentTemplateId = await getUserTemplate()
  const isPremium = await isUserPremium()

  return <TemplateGalleryClient currentTemplateId={currentTemplateId} isPremium={isPremium} />
}
