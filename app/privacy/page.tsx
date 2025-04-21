import type { Metadata } from "next"
import { LucernaSunIcon } from "@/components/lucerna-sun-icon"

export const metadata: Metadata = {
  title: "Privacy Policy | Lucerna AI",
  description: "Learn how Lucerna AI protects your data and privacy when using our resume tailoring services.",
  keywords: "privacy policy, data protection, resume privacy, Lucerna AI privacy",
}

export default function PrivacyPage() {
  return (
    <div className="container-narrow py-12">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <LucernaSunIcon size={48} glowing={true} />
        </div>
        <h1 className="mb-3 font-serif">Privacy Policy</h1>
        <p className="text-gray-600">Last updated: April 21, 2025</p>
      </div>

      <div className="prose prose-lg max-w-none">
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
          <p className="text-amber-800 font-medium">
            <strong>Academic Use Only:</strong> Lucerna AI is a non-commercial academic research platform designed for
            educational purposes.
          </p>
        </div>

        <p>
          Lucerna AI ("we", "us", or "our") is a non-commercial academic research platform designed for educational
          purposes. This Privacy Policy outlines how we handle your information when you use our website (lucernai.co).
          By using our platform, you agree to the practices described below.
        </p>

        <h2>1. Data We Collect</h2>
        <p>We collect and store the following types of information:</p>
        <ul>
          <li>
            <strong>Uploaded Content:</strong> Resumes, job descriptions, and other input data you voluntarily provide.
          </li>
          <li>
            <strong>Usage Data:</strong> Interaction logs (e.g., tailoring sessions, page visits) used to improve our
            academic research.
          </li>
          <li>
            <strong>Authentication Data:</strong> Email addresses, login activity, and session tokens (e.g., for
            Supabase auth).
          </li>
        </ul>
        <p>
          We do not sell or share your data with third parties. All data is processed solely for academic,
          non-commercial evaluation.
        </p>

        <h2>2. How We Use Your Data</h2>
        <p>We use your data strictly for the following purposes:</p>
        <ul>
          <li>To analyze and improve our AI tailoring system</li>
          <li>To log anonymous or pseudonymized usage trends for academic papers or internal research</li>
          <li>To provide insights on resume generation effectiveness</li>
        </ul>

        <h2>3. Data Security</h2>
        <p>
          We use industry-standard security practices to store your data (e.g., Supabase/PostgreSQL) and ensure
          encryption where possible. However, as this is a research project, we cannot guarantee commercial-level
          protection.
        </p>

        <h2>4. Your Rights</h2>
        <p>As a user of a research platform:</p>
        <ul>
          <li>You may request deletion of your data by contacting us at: privacy@lucernai.co</li>
          <li>You may choose not to submit personal information</li>
          <li>We do not knowingly collect information from minors under 13.</li>
        </ul>

        <h2>5. Changes to this Policy</h2>
        <p>
          This Privacy Policy may be updated as the project evolves. Any major changes will be clearly announced. Upon
          transitioning to a commercial product, a new policy will be issued and user consent will be requested.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-6">
          <p className="text-blue-800 font-medium">
            <strong>Important Notice:</strong> Some parts of the platform may display features such as "Subscribe,"
            "Upgrade," or "Premium" labels. These are placeholders only for future versions of Lucerna AI. We are not
            charging users or collecting any payments at this time. Please ignore any subscription prompts — the
            platform is currently 100% free for academic use.
          </p>
        </div>

        <h2>Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at:</p>
        <ul>
          <li>Email: privacy@lucernai.co</li>
        </ul>
      </div>
    </div>
  )
}
