import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  FileText,
  Wand2,
  CheckCircle,
  BarChart,
  RefreshCw,
  Download,
  Star,
  Zap,
  Shield,
  Award,
  Search,
  Clock,
} from "lucide-react"
import { LucernaSunIcon } from "@/components/lucerna-sun-icon"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Lucerna AI | AI-Powered Resume Tailoring & ATS Optimization",
  description:
    "Transform your job search with Lucerna AI's intelligent resume tailoring. Our AI analyzes job descriptions to create ATS-optimized resumes that get you more interviews.",
  keywords:
    "resume builder, AI resume, ATS optimization, job application, resume tailoring, career advancement, professional resume",
  openGraph: {
    title: "Lucerna AI | AI-Powered Resume Tailoring & ATS Optimization",
    description:
      "Transform your job search with Lucerna AI's intelligent resume tailoring. Our AI analyzes job descriptions to create ATS-optimized resumes that get you more interviews.",
    url: "https://lucernai.co",
    siteName: "Lucerna AI",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Lucerna AI - Illuminate Your Career Journey",
      },
    ],
    locale: "en_US",
    type: "website",
  },
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="section-padding py-20 md:py-28 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 z-0"></div>
        <div className="absolute top-20 right-10 w-64 h-64 bg-sky/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-forest/10 rounded-full filter blur-3xl"></div>

        <div className="container-wide flex flex-col items-center text-center relative z-10">
          <div className="mb-6 animate-float">
            <LucernaSunIcon size={64} glowing={true} className="mb-4" />
          </div>
          <h1 className="mb-4 max-w-4xl text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-midnight animate-fade-in">
            Illuminate Your Career Journey with AI-Powered Resume Tailoring
          </h1>
          <p className="mb-8 text-xl text-gray-600 max-w-2xl animate-fade-in-delay">
            Let your professional story shine with clarity. Lucerna AI analyzes job descriptions and optimizes your
            resume to get more interviews and advance your career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-delay-2">
            <Button asChild size="lg" className="px-6 py-6 text-lg btn-glow">
              <Link href="/dashboard">
                Start Tailoring Your Resume
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-6 py-6 text-lg">
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-6 text-sm text-gray-500 animate-fade-in-delay-3">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-amber-400 mr-1" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="hidden md:flex items-center">
              <Shield className="h-4 w-4 text-forest mr-1" />
              <span>100% Secure</span>
            </div>
            <div className="flex items-center">
              <Award className="h-4 w-4 text-sky mr-1" />
              <span>10,000+ Successful Applications</span>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl font-serif text-midnight">
              Why Job Seekers Choose Lucerna AI
            </h2>
            <p className="mt-4 text-midnight/70 md:text-lg max-w-2xl mx-auto">
              Our AI-powered platform gives you the competitive edge in today's challenging job market.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-lg border shadow-soft card-hover transform transition-all duration-300 hover:scale-105 hover:bg-golden-yellow/10 hover:vibrate">
              <div className="w-14 h-14 rounded-full bg-sky/10 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-sky" />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-serif text-midnight">ATS-Optimized Resumes</h3>
              <p className="text-midnight/70">
                Our AI ensures your resume passes through Applicant Tracking Systems with a 95%+ success rate.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg border shadow-soft card-hover transform transition-all duration-300 hover:scale-105 hover:bg-golden-yellow/10 hover:vibrate">
              <div className="w-14 h-14 rounded-full bg-forest/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-forest" />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-serif text-midnight">Job-Specific Tailoring</h3>
              <p className="text-midnight/70">
                Customize your resume for each job application in minutes, not hours, with our intelligent AI.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg border shadow-soft card-hover transform transition-all duration-300 hover:scale-105 hover:bg-golden-yellow/10 hover:vibrate">
              <div className="w-14 h-14 rounded-full bg-sky/10 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-sky" />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-serif text-midnight">Time-Saving Efficiency</h3>
              <p className="text-midnight/70">
                Create a professionally tailored resume in under 5 minutes, saving you hours of frustration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Overview */}
      <section id="how-it-works" className="py-20 bg-cloud scroll-mt-20">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl font-serif text-midnight">
              How Lucerna AI Works
            </h2>
            <p className="mt-4 text-midnight/70 md:text-lg max-w-2xl mx-auto">
              Our AI-powered platform transforms your resume into a tailored masterpiece in six simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 relative">
            {/* Connection lines for desktop */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-sky to-forest hidden lg:block"></div>

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-6 bg-cloud rounded-lg border shadow-soft card-hover hover:glow-effect relative">
              <div className="w-14 h-14 rounded-full bg-sky/10 flex items-center justify-center mb-4 relative z-10">
                <FileText className="h-6 w-6 text-sky" />
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-sky text-white flex items-center justify-center text-sm font-bold">
                  1
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-serif text-midnight">Upload</h3>
              <p className="text-midnight/70">Upload your resume and the job description you're targeting.</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-6 bg-cloud rounded-lg border shadow-soft card-hover hover:glow-effect relative">
              <div className="w-14 h-14 rounded-full bg-sky/10 flex items-center justify-center mb-4 relative z-10">
                <Wand2 className="h-6 w-6 text-sky" />
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-sky text-white flex items-center justify-center text-sm font-bold">
                  2
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-serif text-midnight">Tailor</h3>
              <p className="text-midnight/70">
                Our AI tailors your resume to match the job requirements with precision.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-6 bg-cloud rounded-lg border shadow-soft card-hover hover:glow-effect relative">
              <div className="w-14 h-14 rounded-full bg-forest/10 flex items-center justify-center mb-4 relative z-10">
                <CheckCircle className="h-6 w-6 text-forest" />
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-forest text-white flex items-center justify-center text-sm font-bold">
                  3
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-serif text-midnight">Golden Rules</h3>
              <p className="text-midnight/70">
                We verify your resume meets essential quality standards and best practices.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center p-6 bg-cloud rounded-lg border shadow-soft card-hover hover:glow-effect relative">
              <div className="w-14 h-14 rounded-full bg-sky/10 flex items-center justify-center mb-4 relative z-10">
                <BarChart className="h-6 w-6 text-sky" />
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-sky text-white flex items-center justify-center text-sm font-bold">
                  4
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-serif text-midnight">Score</h3>
              <p className="text-midnight/70">
                Get ATS compatibility and job description match scores to gauge effectiveness.
              </p>
            </div>

            {/* Step 5 */}
            <div className="flex flex-col items-center text-center p-6 bg-cloud rounded-lg border shadow-soft card-hover hover:glow-effect relative">
              <div className="w-14 h-14 rounded-full bg-sky/10 flex items-center justify-center mb-4 relative z-10">
                <RefreshCw className="h-6 w-6 text-sky" />
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-sky text-white flex items-center justify-center text-sm font-bold">
                  5
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-serif text-midnight">Refine</h3>
              <p className="text-midnight/70">
                Further optimize your resume with one-click refinements and suggestions.
              </p>
            </div>

            {/* Step 6 */}
            <div className="flex flex-col items-center text-center p-6 bg-cloud rounded-lg border shadow-soft card-hover hover:glow-effect relative">
              <div className="w-14 h-14 rounded-full bg-sky/10 flex items-center justify-center mb-4 relative z-10">
                <Download className="h-6 w-6 text-sky" />
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-sky text-white flex items-center justify-center text-sm font-bold">
                  6
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-serif text-midnight">Download</h3>
              <p className="text-midnight/70">
                Download your tailored resume in multiple formats ready for submission.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl font-serif text-midnight">
              Advanced Resume Optimization Features
            </h2>
            <p className="mt-4 text-midnight/70 md:text-lg max-w-2xl mx-auto">
              Lucerna AI offers comprehensive tools to enhance your job application materials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
            <div className="flex flex-col">
              <div className="bg-gradient-to-br from-sky/10 to-forest/10 p-1 rounded-lg shadow-md">
                <div className="bg-white p-6 rounded-lg h-full">
                  <h3 className="text-2xl font-semibold mb-4 font-serif text-midnight">Resume Analysis</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-forest mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-midnight/80">
                        ATS compatibility scoring to ensure your resume passes automated filters
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-forest mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-midnight/80">Keyword optimization based on job description analysis</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-forest mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-midnight/80">
                        Content gap identification to highlight missing skills and experiences
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-forest mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-midnight/80">
                        Professional language enhancement and clarity improvements
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="bg-gradient-to-br from-sky/10 to-forest/10 p-1 rounded-lg shadow-md">
                <div className="bg-white p-6 rounded-lg h-full">
                  <h3 className="text-2xl font-semibold mb-4 font-serif text-midnight">Complete Career Tools</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-forest mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-midnight/80">
                        AI-generated cover letters matched to your resume and job description
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-forest mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-midnight/80">LinkedIn profile optimization to attract recruiters</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-forest mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-midnight/80">Interview preparation with AI-powered practice sessions</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-forest mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-midnight/80">
                        Career analytics dashboard to track your application progress
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-cloud">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl font-serif text-midnight">Success Stories</h2>
            <p className="mt-4 text-midnight/70 md:text-lg max-w-2xl mx-auto">
              See how Lucerna AI has helped job seekers land their dream positions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-midnight/80 italic mb-4">
                "After months of job searching with no callbacks, I used Lucerna AI to tailor my resume. Within two
                weeks, I had three interviews and landed my dream job in tech."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-sky/20 rounded-full flex items-center justify-center text-sky font-bold">
                  JD
                </div>
                <div className="ml-3">
                  <p className="font-medium text-midnight">James D.</p>
                  <p className="text-sm text-midnight/60">Software Engineer</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-midnight/80 italic mb-4">
                "The ATS optimization feature was a game-changer. My applications started getting responses almost
                immediately after I switched to Lucerna AI's tailored resumes."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-forest/20 rounded-full flex items-center justify-center text-forest font-bold">
                  SM
                </div>
                <div className="ml-3">
                  <p className="font-medium text-midnight">Sarah M.</p>
                  <p className="text-sm text-midnight/60">Marketing Director</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-midnight/80 italic mb-4">
                "I was skeptical about AI resume tools, but Lucerna AI exceeded my expectations. The tailoring was so
                precise that interviewers specifically mentioned how well my experience matched their needs."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-sky/20 rounded-full flex items-center justify-center text-sky font-bold">
                  RT
                </div>
                <div className="ml-3">
                  <p className="font-medium text-midnight">Robert T.</p>
                  <p className="text-sm text-midnight/60">Project Manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container-narrow">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl font-serif text-midnight">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-midnight/70 md:text-lg max-w-2xl mx-auto">
              Get answers to common questions about Lucerna AI's resume tailoring service.
            </p>
          </div>

          <div className="space-y-6 mt-8">
            <div className="bg-cloud rounded-lg p-6">
              <h3 className="text-xl font-semibold text-midnight mb-2">How does Lucerna AI tailor my resume?</h3>
              <p className="text-midnight/70">
                Lucerna AI uses advanced natural language processing to analyze job descriptions and identify key
                requirements, skills, and qualifications. It then intelligently restructures and enhances your resume to
                highlight relevant experiences and skills, ensuring optimal matching with the job requirements.
              </p>
            </div>

            <div className="bg-cloud rounded-lg p-6">
              <h3 className="text-xl font-semibold text-midnight mb-2">Will my tailored resume pass ATS systems?</h3>
              <p className="text-midnight/70">
                Yes! Lucerna AI is specifically designed to optimize your resume for Applicant Tracking Systems. Our
                algorithm ensures proper formatting, keyword optimization, and content structure that maximizes your
                resume's compatibility with ATS software used by most employers.
              </p>
            </div>

            <div className="bg-cloud rounded-lg p-6">
              <h3 className="text-xl font-semibold text-midnight mb-2">How long does it take to tailor my resume?</h3>
              <p className="text-midnight/70">
                The entire process takes less than 5 minutes. Simply upload your existing resume and the job
                description, and our AI will analyze and tailor your resume within seconds. You can then review, make
                any desired adjustments, and download your optimized resume.
              </p>
            </div>

            <div className="bg-cloud rounded-lg p-6">
              <h3 className="text-xl font-semibold text-midnight mb-2">Is my data secure with Lucerna AI?</h3>
              <p className="text-midnight/70">
                Absolutely. We take data privacy seriously. Your resume and personal information are encrypted and
                securely stored. We never share your data with third parties, and you can request deletion of your
                information at any time through your account settings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding py-20 bg-gradient-to-b from-cloud to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 z-0"></div>
        <div className="absolute top-20 right-10 w-64 h-64 bg-sky/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-forest/10 rounded-full filter blur-3xl"></div>

        <div className="container-narrow text-center relative z-10">
          <h2 className="mb-4 text-3xl md:text-4xl font-bold font-serif text-midnight">
            Ready to Illuminate Your Career?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers who have successfully tailored their resumes and secured interviews with
            Lucerna AI.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="px-6 py-6 text-lg btn-glow">
              <Link href="/auth?signup=true">
                Get Started For Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-6 py-6 text-lg">
              <Link href="/pricing">View Pricing Plans</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-gray-500">No credit card required. Start with our free plan today.</p>
        </div>
      </section>
    </div>
  )
}
