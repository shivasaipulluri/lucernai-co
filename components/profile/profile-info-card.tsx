"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Mail, Calendar } from "lucide-react"

interface ProfileInfoCardProps {
  profile: any
}

export function ProfileInfoCard({ profile }: ProfileInfoCardProps) {
  // Format the creation date
  const formatCreationDate = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch (error) {
      return "Unknown date"
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Account Information</span>
          <Badge
            variant={profile.isPremium ? "default" : "outline"}
            className={profile.isPremium ? "bg-amber-500 text-primary" : ""}
          >
            {profile.isPremium ? "Premium" : "Free"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-500 flex items-center mb-1">
                <Mail className="h-4 w-4 mr-1" />
                Email Address
              </div>
              <p>{profile.email}</p>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500 flex items-center mb-1">
                <Calendar className="h-4 w-4 mr-1" />
                Account Created
              </div>
              <p>{formatCreationDate(profile.createdAt)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Authentication Provider</div>
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2">
                  Supabase
                </Badge>
                {profile.email.includes("gmail") && (
                  <Badge variant="outline" className="bg-blue-50">
                    Google
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Account Status</div>
              <div className="flex items-center">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Active
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
