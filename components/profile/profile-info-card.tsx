"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDistanceToNow } from "date-fns"
import { Mail, Calendar, User, Settings, Save, Edit, X, RefreshCw } from "lucide-react"
import { updateUserProfile, type ProfileUpdateData } from "@/lib/actions/profile-actions"
import { useToast } from "@/hooks/use-toast" // Fixed import path
import { useRouter } from "next/navigation"

interface ProfileInfoCardProps {
  profile: any
}

export function ProfileInfoCard({ profile }: ProfileInfoCardProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    fullName: profile.fullName || "",
    preferredTailoringMode: profile.preferredTailoringMode || "basic",
    analyticsTimeRange: profile.analyticsTimeRange || "30days",
    analyticsViewMode: profile.analyticsViewMode || "detailed",
  })

  // Update form data when profile changes
  useEffect(() => {
    setFormData({
      fullName: profile.fullName || "",
      preferredTailoringMode: profile.preferredTailoringMode || "basic",
      analyticsTimeRange: profile.analyticsTimeRange || "30days",
      analyticsViewMode: profile.analyticsViewMode || "detailed",
    })
  }, [profile])

  // Format the creation date
  const formatCreationDate = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch (error) {
      return "Unknown date"
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Only include fields that have changed
      const updateData: ProfileUpdateData = {}
      if (formData.fullName !== (profile.fullName || "")) updateData.fullName = formData.fullName
      if (formData.preferredTailoringMode !== (profile.preferredTailoringMode || "basic")) {
        updateData.preferredTailoringMode = formData.preferredTailoringMode
      }
      if (formData.analyticsTimeRange !== (profile.analyticsTimeRange || "30days")) {
        updateData.analyticsTimeRange = formData.analyticsTimeRange
      }
      if (formData.analyticsViewMode !== (profile.analyticsViewMode || "detailed")) {
        updateData.analyticsViewMode = formData.analyticsViewMode
      }

      const result = await updateUserProfile(updateData)

      if (result.success) {
        toast({
          title: "Profile Updated",
          description: result.message,
        })
        setIsEditing(false)

        // Force a refresh of the page to show the updated data
        router.refresh()
      } else {
        toast({
          title: "Update Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      fullName: profile.fullName || "",
      preferredTailoringMode: profile.preferredTailoringMode || "basic",
      analyticsTimeRange: profile.analyticsTimeRange || "30days",
      analyticsViewMode: profile.analyticsViewMode || "detailed",
    })
    setIsEditing(false)
  }

  const handleRefresh = () => {
    router.refresh()
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Account Information</span>
          <div className="flex gap-2">
            <Badge
              variant={profile.isPremium ? "default" : "outline"}
              className={profile.isPremium ? "bg-amber-500 text-primary" : ""}
            >
              {profile.isPremium ? "Premium" : "Free"}
            </Badge>
            {!isEditing ? (
              <>
                <Button variant="ghost" size="sm" onClick={handleRefresh} title="Refresh profile data">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </>
            ) : null}
          </div>
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
                <User className="h-4 w-4 mr-1" />
                Full Name
              </div>
              {isEditing ? (
                <div className="mt-1">
                  <Input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>
              ) : (
                <p>{profile.fullName || "Not set"}</p>
              )}
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
              <div className="text-sm font-medium text-gray-500 flex items-center mb-1">
                <Settings className="h-4 w-4 mr-1" />
                Preferred Tailoring Mode
              </div>
              {isEditing ? (
                <div className="mt-1">
                  <Select
                    value={formData.preferredTailoringMode}
                    onValueChange={(value) => handleSelectChange("preferredTailoringMode", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tailoring mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="personalized">Personalized</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <p className="capitalize">{profile.preferredTailoringMode || "Basic"}</p>
              )}
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500 flex items-center mb-1">
                <Settings className="h-4 w-4 mr-1" />
                Analytics Time Range
              </div>
              {isEditing ? (
                <div className="mt-1">
                  <Select
                    value={formData.analyticsTimeRange}
                    onValueChange={(value) => handleSelectChange("analyticsTimeRange", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">7 Days</SelectItem>
                      <SelectItem value="30days">30 Days</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <p>
                  {profile.analyticsTimeRange === "7days"
                    ? "7 Days"
                    : profile.analyticsTimeRange === "30days"
                      ? "30 Days"
                      : profile.analyticsTimeRange === "all"
                        ? "All Time"
                        : "30 Days"}
                </p>
              )}
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500 flex items-center mb-1">
                <Settings className="h-4 w-4 mr-1" />
                Analytics View Mode
              </div>
              {isEditing ? (
                <div className="mt-1">
                  <Select
                    value={formData.analyticsViewMode}
                    onValueChange={(value) => handleSelectChange("analyticsViewMode", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select view mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <p className="capitalize">{profile.analyticsViewMode || "Detailed"}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      {isEditing && (
        <CardFooter className="flex justify-end space-x-2 pt-0">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
