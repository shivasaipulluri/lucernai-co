"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export type ContactFormData = {
  name: string
  email: string
  subject: string
  message: string
}

export async function submitContactForm(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const subject = formData.get("subject") as string
    const message = formData.get("message") as string

    // Validate inputs
    if (!name || !email || !subject || !message) {
      return {
        success: false,
        message: "All fields are required",
      }
    }

    if (!email.includes("@")) {
      return {
        success: false,
        message: "Please enter a valid email address",
      }
    }

    // Store in database
    await prisma.contactSubmission.create({
      data: {
        name,
        email,
        subject,
        message,
        createdAt: new Date(),
      },
    })

    // Here you could also add email sending functionality using a service like Resend, SendGrid, etc.
    // Example with SendGrid would be:
    // await sendEmail({
    //   to: "support@lucernai.co",
    //   subject: `New Contact Form: ${subject}`,
    //   text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    // });

    revalidatePath("/contact")
    return {
      success: true,
      message: "Your message has been sent successfully. We'll get back to you soon!",
    }
  } catch (error) {
    console.error("Error submitting contact form:", error)
    return {
      success: false,
      message: "There was an error sending your message. Please try again later.",
    }
  }
}
