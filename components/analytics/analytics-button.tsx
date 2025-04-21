"use client"

import type React from "react"

import { type ButtonHTMLAttributes, forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { logAnalyticsEvent } from "@/lib/analytics"

interface AnalyticsButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  eventName: string
  metadata?: Record<string, any>
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export const AnalyticsButton = forwardRef<HTMLButtonElement, AnalyticsButtonProps>(
  ({ eventName, metadata = {}, onClick, variant, size, children, ...props }, ref) => {
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      // Log the analytics event
      try {
        await logAnalyticsEvent(eventName, metadata)
      } catch (error) {
        console.error(`Failed to log analytics event ${eventName}:`, error)
      }

      // Call the original onClick handler if provided
      if (onClick) {
        onClick(e)
      }
    }

    return (
      <Button ref={ref} variant={variant} size={size} onClick={handleClick} {...props}>
        {children}
      </Button>
    )
  },
)

AnalyticsButton.displayName = "AnalyticsButton"
