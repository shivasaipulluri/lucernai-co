import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, Wand2, CheckCircle, BarChart, RefreshCw, Download } from "lucide-react"
import { LucernaSunIcon } from "@/components/lucerna-sun-icon"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-b from-white to-gray-50">
        <div className="container-wide flex flex-col items-center text-center">
          <div className="mb-6">
            <LucernaSunIcon size={48} glowing={true} className="mb-4" />
          </div>
          <h1 className="mb-4 max-w-4xl">Illuminate Your Career Journey</h1>
          <p className="mb-8 text-xl text-gray-600 max-w-2xl">
            Let your story shine with clarity. Lucerna AI refines, you rise.
          </p>
          <Button asChild size="lg" className="px-6 py-6 text-lg btn-glow">
            <Link href="/dashboard">
              Start Tailoring
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Process Overview */}
      <section className="py-20 bg-white">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl font-serif text-midnight">How It Works</h2>
            <p className="mt-4 text-midnight/70 md:text-lg max-w-2xl mx-auto">
              Our AI-powered platform transforms your resume into a tailored masterpiece in six simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-6 bg-cloud rounded-lg border shadow-soft card-hover hover:glow-effect">
              <div className="w-14 h-14 rounded-full bg-sky/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-sky" />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-serif text-midnight">Upload</h3>
              <p className="text-midnight/70">Upload your resume and the job description you're targeting.</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-6 bg-cloud rounded-lg border shadow-soft card-hover hover:glow-effect">
              <div className="w-14 h-14 rounded-full bg-sky/10 flex items-center justify-center mb-4">
                <Wand2 className="h-6 w-6 text-sky" />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-serif text-midnight">Tailor</h3>
              <p className="text-midnight/70">Our AI tailors your resume to match the job requirements.</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-6 bg-cloud rounded-lg border shadow-soft card-hover hover:glow-effect">
              <div className="w-14 h-14 rounded-full bg-forest/10 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-forest" />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-serif text-midnight">Golden Rules</h3>
              <p className="text-midnight/70">We verify your resume meets essential quality standards.</p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center p-6 bg-cloud rounded-lg border shadow-soft card-hover hover:glow-effect">
              <div className="w-14 h-14 rounded-full bg-sky/10 flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-sky" />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-serif text-midnight">Score</h3>
              <p className="text-midnight/70">Get ATS compatibility and job description match scores.</p>
            </div>

            {/* Step 5 */}
            <div className="flex flex-col items-center text-center p-6 bg-cloud rounded-lg border shadow-soft card-hover hover:glow-effect">
              <div className="w-14 h-14 rounded-full bg-sky/10 flex items-center justify-center mb-4">
                <RefreshCw className="h-6 w-6 text-sky" />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-serif text-midnight">Refine</h3>
              <p className="text-midnight/70">Further optimize your resume with one-click refinements.</p>
            </div>

            {/* Step 6 */}
            <div className="flex flex-col items-center text-center p-6 bg-cloud rounded-lg border shadow-soft card-hover hover:glow-effect">
              <div className="w-14 h-14 rounded-full bg-sky/10 flex items-center justify-center mb-4">
                <Download className="h-6 w-6 text-sky" />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-serif text-midnight">Download</h3>
              <p className="text-midnight/70">Download your tailored resume in multiple formats.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Points */}
      <section className="py-20 bg-cloud">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl font-serif text-midnight">
              Why Choose Lucerna AI
            </h2>
            <p className="mt-4 text-midnight/70 md:text-lg max-w-2xl mx-auto">
              Our platform offers unique advantages that set your resume apart from the competition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {/* Value Point 1 */}
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg border shadow-soft card-hover">
              <h3 className="text-xl font-semibold mb-2 font-serif text-midnight">AI-Powered Precision</h3>
              <p className="text-midnight/70">
                Our AI algorithms analyze your resume and job descriptions with unparalleled accuracy.
              </p>
            </div>

            {/* Value Point 2 */}
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg border shadow-soft card-hover">
              <h3 className="text-xl font-semibold mb-2 font-serif text-midnight">ATS Compatibility</h3>
              <p className="text-midnight/70">
                Ensure your resume passes through Applicant Tracking Systems with ease.
              </p>
            </div>

            {/* Value Point 3 */}
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg border shadow-soft card-hover">
              <h3 className="text-xl font-semibold mb-2 font-serif text-midnight">Personalized Storytelling</h3>
              <p className="text-midnight/70">
                We help you craft a compelling narrative that highlights your unique value proposition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-narrow text-center">
          <h2 className="mb-4">Ready to Illuminate Your Career?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers who have successfully tailored their resumes and secured interviews.
          </p>
          <Button asChild size="lg" className="px-6 py-6 text-lg btn-glow">
            <Link href="/auth?signup=true">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
