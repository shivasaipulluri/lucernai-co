"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, AlertTriangle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { usageLimits } from "@/config/usage-limits" // Import usage limits

interface SubscriptionUsageCardProps {
  profile: any
}

export function SubscriptionUsageCard({ profile }: SubscriptionUsageCardProps) {
  // Determine usage limits based on subscription tier
  const limits = profile.isPremium ? usageLimits.premium : usageLimits.free

  // Format the reset date
  const formatResetDate = (date: string | null) => {
    if (!date) return "Not set"
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch (error) {
      return "Unknown date"
    }
  }

  // Calculate progress percentage
  const getProgressPercentage = (used: number, limit: number) => {
    if (limit === Number.POSITIVE_INFINITY) return Math.min(used * 5, 100) // For premium, show some progress based on usage
    return Math.min((used / limit) * 100, 100)
  }

  // Format limit display
  const formatLimit = (limit: number) => {
    return limit === Number.POSITIVE_INFINITY ? "∞" : limit
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Subscription Details</span>
            {profile.isPremium ? (
              <Badge className="bg-amber-500 text-primary">
                <Sparkles className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            ) : (
              <Badge variant="outline">Free</Badge>
            )}
          </CardTitle>
          <CardDescription>
            {profile.isPremium
              ? "You have unlimited access to all Lucerna AI features."
              : "Free tier with limited usage. Upgrade to Premium for unlimited access."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!profile.isPremium && (
            <Button className="w-full mb-6 bg-amber-500 text-primary hover:bg-amber-600">
              <Sparkles className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
          )}

          {profile.usage.resetDate && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md flex items-start">
              <AlertTriangle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-blue-700 font-medium">
                  Usage limits reset {formatResetDate(profile.usage.resetDate)}
                </p>
                <p className="text-xs text-blue-600">Free tier limits reset daily</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Quota Counters */}
            <QuotaCounter
              label="Basic Tailorings"
              used={profile.usage.basicTailorings}
              limit={limits.basicTailorings}
              resetDate={profile.usage.resetDate}
            />
            <QuotaCounter
              label="Personalized Tailorings"
              used={profile.usage.personalizedTailorings}
              limit={limits.personalizedTailorings}
              resetDate={profile.usage.resetDate}
            />
            <QuotaCounter
              label="Aggressive Tailorings"
              used={profile.usage.aggressiveTailorings}
              limit={limits.aggressiveTailorings}
              resetDate={profile.usage.resetDate}
            />
            <QuotaCounter
              label="Cover Letters"
              used={profile.usage.coverLetters}
              limit={limits.coverLetters}
              resetDate={profile.usage.resetDate}
            />
            <QuotaCounter
              label="LinkedIn Optimizations"
              used={profile.usage.linkedinOptimizations}
              limit={limits.linkedinOptimizations}
              resetDate={profile.usage.resetDate}
            />
            <QuotaCounter
              label="Interview Sessions"
              used={profile.usage.interviewSessions}
              limit={limits.interviewSessions}
              resetDate={profile.usage.resetDate}
            />
          </div>
        </CardContent>
      </Card>

      {!profile.isPremium && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start">
              <Sparkles className="h-5 w-5 text-amber-500 mr-3 mt-1" />
              <div>
                <h3 className="font-medium text-amber-800 mb-1">Premium Benefits</h3>
                <ul className="space-y-2 text-sm text-amber-700">
                  <li>• Unlimited resume tailorings in all modes</li>
                  <li>• Unlimited cover letter generation</li>
                  <li>• Unlimited LinkedIn profile optimizations</li>
                  <li>• Unlimited interview coaching sessions</li>
                  <li>• Access to premium resume templates</li>
                  <li>• Priority AI processing</li>
                </ul>
                <Button className="mt-4 bg-amber-500 text-primary hover:bg-amber-600">Upgrade Now</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface QuotaCounterProps {
  label: string
  used: number
  limit: number
  resetDate: string | null
}

function QuotaCounter({ label, used, limit, resetDate }: QuotaCounterProps) {
  // Format the reset date
  const formatResetDate = (date: string | null) => {
    if (!date) return "Not set"
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch (error) {
      return "Unknown date"
    }
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-500 italic">Resets {formatResetDate(resetDate)}</p>
      </div>
      <Badge variant="secondary" className="px-2 py-1 text-xs font-medium">
        {used} / {limit === Number.POSITIVE_INFINITY ? "∞" : limit}
      </Badge>
    </div>
  )
}
