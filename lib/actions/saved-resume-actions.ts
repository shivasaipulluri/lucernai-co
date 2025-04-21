"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getSavedResumes(userId: string) {
  const resumes = await prisma.resume.findMany({
    where: {
      userId,
      isSaved: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  return resumes.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }))
}

export async function renameResume(resumeId: string, userId: string, newLabel: string) {
  try {
    await prisma.resume.update({
      where: {
        id: resumeId,
        userId: userId, // Security check to ensure user owns this resume
      },
      data: {
        label: newLabel,
      },
    })

    revalidatePath("/saved-resumes")
    return { success: true }
  } catch (error) {
    console.error("Error renaming resume:", error)
    return { success: false, error: "Failed to rename resume" }
  }
}

export async function deleteResume(resumeId: string, userId: string) {
  try {
    await prisma.resume.update({
      where: {
        id: resumeId,
        userId: userId, // Security check to ensure user owns this resume
      },
      data: {
        isSaved: false, // Soft delete by marking as not saved
      },
    })

    revalidatePath("/saved-resumes")
    return { success: true }
  } catch (error) {
    console.error("Error deleting resume:", error)
    return { success: false, error: "Failed to delete resume" }
  }
}
