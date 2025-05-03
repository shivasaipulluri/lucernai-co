import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { redirect } from "next/navigation"
import { ResumeBuilderCard } from "@/components/dashboard/resume-builder-card"

export const metadata = {
  title: "Tailoring Lab | Lucerna AI",
  description: "Upload your resume and tailor it to job descriptions",
}

async function getUserResumes() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const resumes = await prisma.resume.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { success: true, data: resumes, hasResumes: resumes.length > 0 }
  } catch (error) {
    console.error("Error fetching user resumes:", error)
    return { success: false, error: "Failed to fetch resumes", hasResumes: false }
  }
}

export default async function TailoringLabPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  // Await searchParams to ensure it's fully resolved
  const params = await searchParams

  // Get the active tab from the query parameters
  const activeTab = params.tab || "history"

  // Get user's resumes
  const resumeResult = await getUserResumes()

  // If not authenticated, redirect to auth page
  if (!resumeResult.success && resumeResult.error === "Not authenticated") {
    redirect("/auth")
  }

  const hasResumes = resumeResult.success && resumeResult.hasResumes === true

  return (
    <div className="container-wide py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <ResumeBuilderCard />
        <div className="md:col-span-2">
          <DashboardContent hasResumes={hasResumes} />
        </div>
      </div>
    </div>
  )
}
