"use server"

import { prisma } from "@/lib/prisma"

export async function getResumeTimeline(userId: string) {
  const resumes = await prisma.resume.findMany({
    where: {
      userId,
      version: { gt: 1 }, // ✅ Only show tailored versions
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  return resumes.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    atsScore: r.atsScore === null ? null : r.atsScore,
    jdScore: r.jdScore === null ? null : r.jdScore,
  }))
}
