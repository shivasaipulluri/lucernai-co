"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Cookie, CookieIcon as CookieOff, Sparkles } from "lucide-react"

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)
  const [cookieJumping, setCookieJumping] = useState(false)
  const [cookieBite, setCookieBite] = useState(false)

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem("cookieConsent")
    if (!hasConsented) {
      // Delay showing the popup for a better UX
      const timer = setTimeout(() => {
        setShowConsent(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptCookies = () => {
    setCookieBite(true)
    // Play bite animation then hide
    setTimeout(() => {
      localStorage.setItem("cookieConsent", "true")
      setShowConsent(false)
    }, 1000)
  }

  const declineCookies = () => {
    localStorage.setItem("cookieConsent", "false")
    setShowConsent(false)
  }

  // Make cookie jump every few seconds
  useEffect(() => {
    if (showConsent) {
      const interval = setInterval(() => {
        setCookieJumping(true)
        setTimeout(() => setCookieJumping(false), 500)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [showConsent])

  if (!showConsent) return null

  return (
    <AnimatePresence>
      {showConsent && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="fixed bottom-4 left-0 right-0 mx-auto w-full max-w-md z-50 px-4"
        >
          <div className="bg-amber-50 rounded-xl shadow-lg p-6 border-2 border-amber-200 relative overflow-hidden">
            {/* Sparkles decoration */}
            <motion.div
              className="absolute top-2 right-2 text-amber-400"
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
            >
              <Sparkles size={20} />
            </motion.div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <motion.div animate={cookieJumping ? { y: [-10, 0] } : {}} transition={{ type: "spring", bounce: 0.6 }}>
                  {cookieBite ? (
                    <div className="relative">
                      <Cookie size={40} className="text-amber-700" />
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-white rounded-full h-5 w-5"
                      />
                    </div>
                  ) : (
                    <Cookie size={40} className="text-amber-700" />
                  )}
                </motion.div>
              </div>

              <div className="flex-1">
                <h3 className="font-serif text-lg font-medium text-amber-800">Cookie Consent</h3>
                <p className="text-amber-700 text-sm mt-1">
                  Our cookies don't crumble your privacy! They just help us make your experience sweeter.
                  <span className="italic"> Nom nom nom...</span>
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-4 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={declineCookies}
                className="text-gray-600 border-gray-300 hover:bg-gray-100"
              >
                <CookieOff size={16} className="mr-1.5" />
                No thanks
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={acceptCookies}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Cookie size={16} className="mr-1.5" />
                Take a bite!
              </Button>
            </div>

            {/* Cookie crumbs */}
            <motion.div
              className="absolute bottom-1 left-10 h-1 w-1 rounded-full bg-amber-800 opacity-70"
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, delay: 0.5 }}
            />
            <motion.div
              className="absolute bottom-2 left-16 h-1.5 w-1.5 rounded-full bg-amber-800 opacity-70"
              animate={{ y: [0, 3, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
