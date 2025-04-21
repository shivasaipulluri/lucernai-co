import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import mammoth from "mammoth"

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

    // Get the form data
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file type
    if (!file.name.endsWith(".docx") && !file.name.endsWith(".doc")) {
      return NextResponse.json({ error: "Invalid file type. Only DOCX and DOC files are supported." }, { status: 400 })
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Extract text from DOCX using mammoth
    const result = await mammoth.extractRawText({ buffer })
    const text = result.value

    // Return the extracted text
    return NextResponse.json({ text })
  } catch (error) {
    console.error("Error extracting text from DOCX:", error)
    return NextResponse.json({ error: "Failed to extract text from document" }, { status: 500 })
  }
}
