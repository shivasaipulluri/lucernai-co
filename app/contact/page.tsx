import type { Metadata } from "next"
import ContactPageClient from "./ContactPageClient"

export const metadata: Metadata = {
  title: "Contact Us | Lucerna AI",
  description:
    "Get in touch with the Lucerna AI team for support, feedback, or partnership inquiries about our resume tailoring services.",
  keywords: "contact, support, help, feedback, Lucerna AI contact",
}

export default function ContactPage() {
  return <ContactPageClient />
}
