import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { analyzeJobDescription } from "@/lib/intelligence/jd-analyzer"

export async function POST(request: Request) {
  try {
    // Authenticate the user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    const body = await request.json()
    const { jobDescription, resumeId } = body

    if (!jobDescription || typeof jobDescription !== "string") {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 })
    }

    // Analyze the job description
    const analysis = await analyzeJobDescription(jobDescription)

    if (!analysis.success) {
      return NextResponse.json({ error: analysis.error || "Failed to analyze job description" }, { status: 500 })
    }

    // Store the analysis in the database
    const intelligence = await prisma.jobDescriptionIntelligence.create({
      data: {
        userId: user.id,
        resumeId: resumeId || null,
        role: analysis.data?.role || "Unknown Role",
        seniority: analysis.data?.seniority || "Unknown",
        keywords: analysis.data?.keywords || [],
        responsibilities: analysis.data?.responsibilities || [],
        qualifications: analysis.data?.qualifications || [],
        categories: analysis.data?.categories || { technical: [], soft: [], certifications: [] },
      },
    })

    // Return the analysis
    return NextResponse.json({
      success: true,
      data: {
        id: intelligence.id,
        ...analysis.data,
      },
    })
  } catch (error) {
    console.error("Error in JD analysis API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
