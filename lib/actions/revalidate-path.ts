"use server"

import { revalidatePath } from "next/cache"

export async function revalidateResume(resumeId: string) {
  revalidatePath(`/resume/${resumeId}`)
  revalidatePath(`/resume/${resumeId}/edit`)
  revalidatePath("/dashboard")
}

export async function revalidateCoverLetter() {
  revalidatePath("/cover-letter")
  revalidatePath("/dashboard")
}

export async function revalidateLinkedIn() {
  revalidatePath("/linkedin")
}

export async function revalidateTemplates() {
  revalidatePath("/templates")
}

export async function revalidateAnalytics() {
  revalidatePath("/analytics")
}
