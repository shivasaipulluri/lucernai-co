"use server"

import { prisma } from "@/lib/prisma"

export async function ensureUserInDb(userId: string, email: string) {
  console.log("Server action: Ensuring user exists in database:", userId, email)

  try {
    // Check if user exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    // If user doesn't exist, create a new record
    if (!existingUser) {
      console.log("Server action: Creating new user in database:", userId)
      await prisma.user.create({
        data: {
          id: userId,
          email: email,
          isPremium: false,
          dailyBasicTailoringsUsed: 0,
          dailyPersonalizedTailoringsUsed: 0,
          dailyAggressiveTailoringsUsed: 0,
          dailyCoverLettersUsed: 0,
          dailyLinkedinOptimizationsUsed: 0,
          dailyInterviewSessionsUsed: 0,
          dailyResetDate: new Date(),
        },
      })
      console.log("Server action: User created successfully in database")
      return true
    } else {
      console.log("Server action: User already exists in database")
      return true
    }
  } catch (error) {
    console.error("Server action: Error ensuring user in database:", error)
    return false
  }
}
