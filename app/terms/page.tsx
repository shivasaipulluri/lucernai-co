import type { Metadata } from "next"
import { LucernaSunIcon } from "@/components/lucerna-sun-icon"

export const metadata: Metadata = {
  title: "Terms of Service | Lucerna AI",
  description: "Terms and conditions for using Lucerna AI's resume tailoring and career optimization services.",
  keywords: "terms of service, terms and conditions, legal terms, Lucerna AI terms",
}

export default function TermsPage() {
  return (
    <div className="container-narrow py-12">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <LucernaSunIcon size={48} glowing={true} />
        </div>
        <h1 className="mb-3 font-serif">
          Terms of Service <span className="text-amber-600">(Academic Use Only)</span>
        </h1>
        <p className="text-gray-600">Effective Date: April 21, 2025</p>
      </div>

      <div className="prose prose-lg max-w-none">
        <p className="lead">
          Lucerna AI is an experimental academic project provided "as-is" for educational and research purposes. These
          Terms govern your use of our non-commercial platform at lucernai.co.
        </p>

        <h2>1. Non-Commercial Purpose</h2>
        <p>
          Lucerna AI is currently not a business entity and is not monetized. All services are provided free of charge.
          Use of the platform is limited to academic testing, prototyping, and feedback collection.
        </p>

        <h2>2. User Responsibilities</h2>
        <p>You agree:</p>
        <ul>
          <li>To provide accurate data (resumes/job descriptions) for tailoring purposes</li>
          <li>Not to use the platform for illegal, abusive, or harmful purposes</li>
          <li>
            Not to upload confidential, proprietary, or personally sensitive information without proper anonymization
          </li>
        </ul>

        <h2>3. Intellectual Property</h2>
        <p>
          You retain ownership of your uploaded content. We may store and analyze it internally to improve our academic
          work, research findings, and system accuracy.
        </p>

        <h2>4. Limitation of Liability</h2>
        <p>Lucerna AI is offered with no warranties or guarantees. We are not responsible for:</p>
        <ul>
          <li>Accuracy or outcomes of AI-generated resume suggestions</li>
          <li>Loss of data, career impact, or system interruptions</li>
          <li>External misuse of user-shared resumes or job descriptions</li>
        </ul>

        <h2>5. Future Transition to Commercial Use</h2>
        <p>Lucerna AI reserves the right to evolve into a commercial product in the future. In such case, we will:</p>
        <ul>
          <li>Notify all users via the site and email</li>
          <li>Update these terms and request new consent before any commercial rollout</li>
        </ul>

        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
          <p className="font-medium text-amber-800">Important Notice:</p>
          <p className="text-amber-700">
            Some parts of the platform may display features such as "Subscribe," "Upgrade," or "Premium" labels. These
            are placeholders only for future versions of Lucerna AI. We are not charging users or collecting any
            payments at this time. Please ignore any subscription prompts — the platform is currently 100% free for
            academic use.
          </p>
        </div>

        <h2>6. Termination</h2>
        <p>We reserve the right to restrict access or terminate accounts violating these academic usage terms.</p>

        <h2>7. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at:</p>
        <ul>
          <li>Email: research@lucernai.co</li>
        </ul>
      </div>
    </div>
  )
}
