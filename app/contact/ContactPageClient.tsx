"use client"

import { LucernaSunIcon } from "@/components/lucerna-sun-icon"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Mail, MessageSquare, AlertCircle, CheckCircle } from "lucide-react"
import { submitContactForm } from "@/lib/actions/contact-actions"
import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ContactPageClient() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formResponse, setFormResponse] = useState<{
    success: boolean
    message: string
  } | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setFormResponse(null)

    try {
      const response = await submitContactForm(formData)
      setFormResponse(response)

      // Reset form if successful
      if (response.success) {
        const form = document.getElementById("contact-form") as HTMLFormElement
        form?.reset()
      }
    } catch (error) {
      setFormResponse({
        success: false,
        message: "There was an error sending your message. Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container-wide py-12">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <LucernaSunIcon size={48} glowing={true} />
        </div>
        <h1 className="mb-3 font-serif">Contact Us</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Lucerna AI is an academic initiative currently in its experimental phase, developed and maintained for
          research and educational purposes. While we do not yet operate as a registered business entity, we welcome
          feedback, collaboration inquiries, or questions about the platform.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Send Us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              {formResponse && (
                <Alert
                  className={`mb-4 ${formResponse.success ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"}`}
                >
                  {formResponse.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertTitle>{formResponse.success ? "Success" : "Error"}</AlertTitle>
                  <AlertDescription>{formResponse.message}</AlertDescription>
                </Alert>
              )}

              <form id="contact-form" action={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input id="name" name="name" placeholder="Your name" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input id="email" name="email" type="email" placeholder="your.email@example.com" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <Input id="subject" name="subject" placeholder="How can we help you?" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Your message..."
                    className="min-h-[150px]"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Email Us</h3>
                  <p className="text-gray-600">
                    <a href="mailto:support@lucernai.co" className="hover:underline">
                      support@lucernai.co
                    </a>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">For all communication, please reach out to us via email.</p>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <p className="text-amber-800 text-sm">
                  At this stage, we do not maintain a physical mailing address or phone line. We appreciate your
                  understanding and look forward to connecting through email.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About Lucerna AI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-gray-600">
                  Lucerna AI is an academic research platform designed for educational purposes. Our AI-powered resume
                  tailoring system is currently in an experimental phase.
                </p>
                <p className="text-gray-600">
                  We welcome feedback, collaboration inquiries, and questions about our platform as we continue to
                  develop and improve our services.
                </p>
                <div className="flex items-center mt-4 text-amber-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">We aim to respond to all inquiries within 48 hours.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
