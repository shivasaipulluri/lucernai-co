"use client"

import type { HTMLAttributes } from "react"

interface LanternIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number
  glowing?: boolean
}

export function LanternIcon({ size = 24, glowing = false, className = "", ...props }: LanternIconProps) {
  return (
    <div className={`${glowing ? "lantern-glow" : ""} ${className}`} {...props}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M22 12H20M6 12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12Z"
          stroke="#FBBF24"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="4" fill="#FBBF24" fillOpacity="0.3" />
      </svg>
    </div>
  )
}
