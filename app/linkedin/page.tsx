import { createClient } from "@/lib/supabase/server"
import { LinkedInOptimizerClient } from "@/components/linkedin/linkedin-optimizer-client"
import { redirect } from "next/navigation"

export const metadata = {
  title: "LinkedIn Optimizer | Lucerna AI",
  description: "Optimize your LinkedIn profile to attract recruiters and opportunities",
}

export default async function LinkedInPage({
  searchParams,
}: {
  searchParams: { jobDescription?: string }
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
  
  const jobDescription = params.jobDescription;
  

  return <LinkedInOptimizerClient initialJobDescription={jobDescription} />
}
