import type { Metadata } from "next"

export const siteConfig = {
  name: "Lucerna AI",
  description: "AI-powered resume tailoring to help you stand out in the job market",
  url: "https://lucernai.co",
  ogImage: "/og-image.jpg",
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Lucerna AI | AI-Powered Resume Tailoring & ATS Optimization",
    template: "%s | Lucerna AI",
  },
  description:
    "Transform your job search with Lucerna AI's intelligent resume tailoring. Our AI analyzes job descriptions to create ATS-optimized resumes that get you more interviews.",
  keywords: [
    "resume builder",
    "AI resume",
    "ATS optimization",
    "job application",
    "resume tailoring",
    "career advancement",
    "professional resume",
    "resume templates",
    "job search",
    "interview preparation",
    "cover letter generator",
    "LinkedIn optimization",
  ],
  authors: [
    {
      name: "Lucerna AI",
      url: siteConfig.url,
    },
  ],
  creator: "Lucerna AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: "Lucerna AI | AI-Powered Resume Tailoring & ATS Optimization",
    description:
      "Transform your job search with Lucerna AI's intelligent resume tailoring. Our AI analyzes job descriptions to create ATS-optimized resumes that get you more interviews.",
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Lucerna AI - Illuminate Your Career Journey",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lucerna AI | AI-Powered Resume Tailoring & ATS Optimization",
    description:
      "Transform your job search with Lucerna AI's intelligent resume tailoring. Our AI analyzes job descriptions to create ATS-optimized resumes that get you more interviews.",
    images: [siteConfig.ogImage],
    creator: "@lucernai",
  },
  icons: {
    icon: "/favicon.ico",
    //shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
}
