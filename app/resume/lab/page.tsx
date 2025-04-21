export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { TailoringLabClient } from "@/components/dashboard/TailoringLabClient"

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

export default async function TailoringLabPage() {
  const resumeResult = await getUserResumes()

  if (!resumeResult.success && resumeResult.error === "Not authenticated") {
    redirect("/auth")
  }

  const hasResumes = resumeResult.success && resumeResult.hasResumes === true

  return (
    <div className="container-wide py-6">
      <TailoringLabClient hasResumes={hasResumes} />
    </div>
  )
}
