import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-white border-t py-8">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="flex items-center">
              <span className="text-lg font-bold text-primary">
                lucernai<span className="text-accent">.</span>
              </span>
            </Link>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-600 mb-2">&copy; 2025 Lucerna AI. Illuminating your career journey.</p>
            <div className="flex space-x-6 justify-center md:justify-end">
              <Link href="/privacy" className="text-xs text-gray-500 hover:text-primary">
                Privacy
              </Link>
              <Link href="/terms" className="text-xs text-gray-500 hover:text-primary">
                Terms
              </Link>
              <Link href="/contact" className="text-xs text-gray-500 hover:text-primary">
                Contact
              </Link>
              <Link href="/pricing" className="text-xs text-gray-500 hover:text-primary">
                Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
