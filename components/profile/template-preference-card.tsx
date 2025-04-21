"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, PenSquare, Download, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"

interface TemplatePreferenceCardProps {
  profile: any
}

export function TemplatePreferenceCard({ profile }: TemplatePreferenceCardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Format the date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      return "Unknown date"
    }
  }

  // Navigate to templates page
  const handleChangeTemplate = () => {
    router.push("/templates")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Resume Template Preference</CardTitle>
          <CardDescription>
            Your selected template will be used when exporting or downloading your resumes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2">
              <div className="border rounded-lg overflow-hidden relative">
                {profile.template.isPremium && !profile.isPremium && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-10">
                    <Sparkles className="h-8 w-8 text-amber-500 mb-2" />
                    <p className="text-sm font-medium text-gray-600">Premium Template</p>
                    <Button variant="outline" size="sm" className="mt-2 bg-amber-500 text-primary hover:bg-amber-600">
                      Upgrade to Access
                    </Button>
                  </div>
                )}
                <div className="relative h-64 w-full">
                  <Image
                    src={profile.template.preview || "/placeholder.svg"}
                    alt={profile.template.name}
                    width={400}
                    height={300}
                    className="object-cover"
                  />
                </div>
                <div className="p-4 bg-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{profile.template.name}</h3>
                      <p className="text-xs text-gray-500">{profile.template.layout} layout</p>
                    </div>
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: profile.template.accentColor }}
                      title="Accent color"
                    ></div>
                  </div>
                </div>
              </div>

              <Button onClick={handleChangeTemplate} className="w-full mt-4" disabled={isLoading}>
                <PenSquare className="h-4 w-4 mr-2" />
                Change Template
              </Button>
            </div>

            <div className="w-full md:w-1/2">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Template Details</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium">Font Family</div>
                  <p className="text-sm text-gray-600">{profile.template.fontFamily}</p>
                </div>

                <div>
                  <div className="text-sm font-medium">Layout Style</div>
                  <p className="text-sm text-gray-600">{profile.template.layout}</p>
                </div>

                <div>
                  <div className="text-sm font-medium">Accent Color</div>
                  <div className="flex items-center">
                    <div
                      className="h-4 w-4 rounded-full mr-2"
                      style={{ backgroundColor: profile.template.accentColor }}
                    ></div>
                    <p className="text-sm text-gray-600">{profile.template.accentColor}</p>
                  </div>
                </div>

                {profile.template.isPremium && (
                  <div>
                    <Badge className="bg-amber-500 text-primary">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Premium Template
                    </Badge>
                  </div>
                )}

                {profile.recentExport && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-500" />
                      Last Export
                    </h4>
                    <p className="text-xs text-gray-600 mb-1">
                      Resume v{profile.recentExport.resume.version} exported{" "}
                      {formatDate(profile.recentExport.createdAt)}
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Download className="h-3 w-3 mr-1" />
                      Download Again
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Template Recommendations</CardTitle>
          <CardDescription>Based on your usage, these templates might work well for your resumes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg overflow-hidden">
              <div className="relative h-32">
                <Image
                  src="/templates/previews/modern-sans.png"
                  alt="Modern Sans"
                  width={400}
                  height={300}
                  className="object-cover"
                />
              </div>
              <div className="p-3">
                <h4 className="font-medium text-sm">Modern Sans</h4>
                <p className="text-xs text-gray-500">Popular in Tech</p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="relative h-32">
                <Image
                  src="/templates/previews/executive.png"
                  alt="Executive"
                  width={400}
                  height={300}
                  className="object-cover"
                />
              </div>
              <div className="p-3">
                <h4 className="font-medium text-sm">Executive</h4>
                <p className="text-xs text-gray-500">Popular in Finance</p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="relative h-32">
                <Image
                  src="/templates/previews/minimalist.png"
                  alt="Minimalist"
                  width={400}
                  height={300}
                  className="object-cover"
                />
              </div>
              <div className="p-3">
                <h4 className="font-medium text-sm">Minimalist</h4>
                <p className="text-xs text-gray-500">Popular in Design</p>
              </div>
            </div>
          </div>

          <Button onClick={handleChangeTemplate} variant="outline" className="w-full mt-4">
            Browse All Templates
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
