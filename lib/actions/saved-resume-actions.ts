"use server"
import { prisma } from "@/lib/prisma"

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
