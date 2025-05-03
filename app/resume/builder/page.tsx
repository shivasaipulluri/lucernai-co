import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ResumeBuilder } from "@/components/resume-builder/resume-builder"

export const metadata = {
  title: "Resume Builder | Lucerna AI",
  description: "Create and customize professional resumes with our advanced resume builder",
}

export default async function ResumeBuilderPage() {
  // Check if user is authenticated
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If not authenticated, redirect to auth page
  if (!user) {
    redirect("/auth")
  }

  return (
    <div className="flex flex-col w-full">
      {/* Header section with title and description */}
      <header className="py-6 px-6 bg-white dark:bg-gray-950 border-b">
        <h1 className="text-3xl font-bold tracking-tight">Resume Builder</h1>
        <p className="text-muted-foreground mt-2">
          Create a professional resume with our easy-to-use builder. Customize sections, styling, and content to create
          the perfect resume for your job applications.
        </p>
      </header>

      {/* Full-width builder component */}
      <ResumeBuilder userId={user.id} />
    </div>
  )
}
