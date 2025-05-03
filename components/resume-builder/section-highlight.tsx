"use client"

import type React from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SectionHighlightProps {
  active: boolean
  children: React.ReactNode
  className?: string
}

export function SectionHighlight({ active, children, className }: SectionHighlightProps) {
  return (
    <motion.div
      className={cn("relative transition-all duration-300", active ? "bg-accent/5 dark:bg-accent/10" : "", className)}
      animate={
        active
          ? {
              boxShadow: [
                "0 0 0 0 rgba(251, 191, 36, 0)",
                "0 0 0 4px rgba(251, 191, 36, 0.3)",
                "0 0 0 0 rgba(251, 191, 36, 0)",
              ],
            }
          : {}
      }
      transition={{ duration: 1.5, repeat: active ? 1 : 0 }}
    >
      {children}
      {active && (
        <motion.div
          className="absolute inset-0 pointer-events-none border border-accent rounded-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5 }}
        />
      )}
    </motion.div>
  )
}
