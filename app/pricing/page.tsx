import type { Metadata } from "next"
import Link from "next/link"
import { LucernaSunIcon } from "@/components/lucerna-sun-icon"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Pricing | Lucerna AI Resume Tailoring Services",
  description:
    "Affordable AI-powered resume tailoring services to help you land your dream job. Compare our Free and Premium plans for resume optimization, cover letters, and interview preparation.",
  keywords:
    "resume tailoring pricing, AI resume cost, resume optimization pricing, cover letter service cost, Lucerna AI pricing, affordable resume service, job application tools pricing",
}

export default function PricingPage() {
  return (
    <div className="container-wide py-12">
      <div className="mb-12 text-center">
        <div className="flex justify-center mb-4">
          <LucernaSunIcon size={48} glowing={true} />
        </div>
        <h1 className="mb-3 font-serif">Simple, Transparent Pricing</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose the plan that fits your job search needs. Upgrade or downgrade anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Free Plan */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Free Plan</CardTitle>
            <CardDescription>Perfect for occasional job applications</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-gray-500 ml-2">forever</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>5 Basic resume tailorings per day</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>3 Personalized resume tailorings per day</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>1 Aggressive resume tailoring per day</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>1 Cover letter generation per day</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>1 LinkedIn optimization per day</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>1 Interview coaching session per day</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Basic resume templates</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Standard AI processing speed</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/auth?signup=true">Get Started</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className="border-2 border-amber-200 relative">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-amber-500 text-primary px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              MOST POPULAR
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="text-2xl">Premium Plan</CardTitle>
            <CardDescription>For serious job seekers and career changers</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$19.99</span>
              <span className="text-gray-500 ml-2">per month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span className="font-medium">Unlimited resume tailorings in all modes</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span className="font-medium">Unlimited cover letter generation</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span className="font-medium">Unlimited LinkedIn profile optimizations</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span className="font-medium">Unlimited interview coaching sessions</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Access to all premium resume templates</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Priority AI processing</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Advanced analytics and insights</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Email support within 24 hours</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-amber-500 text-primary hover:bg-amber-600">
              <Link href="/auth?signup=true">Start Premium</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-serif text-center mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-lg mb-2">What is the difference between the tailoring modes?</h3>
            <p className="text-gray-600">
              Basic mode makes minimal changes focusing on keywords, Personalized mode enhances your resume while
              maintaining your voice, and Aggressive mode maximizes keyword matching and restructures content for
              optimal ATS performance.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-2">Can I cancel my Premium subscription anytime?</h3>
            <p className="text-gray-600">
              Yes, you can cancel your Premium subscription at any time through your account settings. Your subscription
              will remain active until the end of your current billing period.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-2">How does the daily limit work for the Free plan?</h3>
            <p className="text-gray-600">
              Daily limits reset at midnight Pacific Time (PT). Unused tailorings do not roll over to the next day.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-2">Is my resume data secure?</h3>
            <p className="text-gray-600">
              Yes, we take data security seriously. Your resume data is encrypted and stored securely. We do not share
              your data with third parties. Our AI processing is temporary and does not store your content after
              processing.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-2">Do you offer refunds?</h3>
            <p className="text-gray-600">
              We offer a 7-day money-back guarantee for Premium subscriptions. If you're not satisfied with our service,
              contact us within 7 days of your purchase for a full refund.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-serif mb-4">Ready to Illuminate Your Career?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Join thousands of job seekers who have successfully landed interviews with Lucerna AI's resume tailoring
          services.
        </p>
        <Button asChild size="lg" className="px-8">
          <Link href="/auth?signup=true">Get Started Today</Link>
        </Button>
      </div>
    </div>
  )
}
