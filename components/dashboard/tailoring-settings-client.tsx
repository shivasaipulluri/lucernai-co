"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Check, Sparkles, Zap, Shield } from "lucide-react"
import { savePreferredTailoringMode } from "@/lib/actions/user-preferences-actions"
import type { TailoringMode } from "@/utils/ai/compile-tailoring-prompt"
import { LucernaSunIcon } from "@/components/lucerna-sun-icon"

interface TailoringSettingsClientProps {
  initialMode: TailoringMode
  tailoringModes: Record<TailoringMode, any>
}

export function TailoringSettingsClient({ initialMode, tailoringModes }: TailoringSettingsClientProps) {
  const [selectedMode, setSelectedMode] = useState<TailoringMode>(initialMode)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSavePreferences = async () => {
    setIsSaving(true)

    try {
      const result = await savePreferredTailoringMode(selectedMode)

      if (result.success) {
        toast({
          title: "Preferences saved",
          description: "Your tailoring preferences have been updated.",
          duration: 3000,
        })
        router.refresh()
      } else {
        throw new Error(result.error || "Failed to save preferences")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Get the icon for a tailoring mode
  const getModeIcon = (mode: TailoringMode) => {
    switch (mode) {
      case "basic":
        return <Shield className="h-5 w-5 text-blue-500" />
      case "personalized":
        return <Sparkles className="h-5 w-5 text-purple-500" />
      case "aggressive":
        return <Zap className="h-5 w-5 text-amber-500" />
      default:
        return <Sparkles className="h-5 w-5 text-purple-500" />
    }
  }

  return (
    <div className="container-wide py-12">
      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <LucernaSunIcon size={32} glowing={true} />
          <h1 className="text-3xl font-serif">Tailoring Settings</h1>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Default Tailoring Mode</CardTitle>
            <CardDescription>
              Choose your preferred tailoring mode for resume optimization. This will be used as the default when
              tailoring new resumes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup value={selectedMode} onValueChange={(value) => setSelectedMode(value as TailoringMode)}>
              {Object.entries(tailoringModes).map(([mode, config]) => (
                <div
                  key={mode}
                  className={`flex items-start space-x-3 border rounded-lg p-4 ${
                    selectedMode === mode ? "border-primary bg-primary/5" : "border-gray-200"
                  }`}
                >
                  <RadioGroupItem value={mode} id={`mode-${mode}`} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={`mode-${mode}`} className="flex items-center text-base font-medium cursor-pointer">
                      {getModeIcon(mode as TailoringMode)}
                      <span className="ml-2">{config.name}</span>
                      {selectedMode === mode && <Check className="ml-2 h-4 w-4 text-primary" />}
                    </Label>
                    <p className="mt-1 text-sm text-gray-600">{config.description}</p>
                    <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
                      {config.additionalGuidance}
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>

            <Button onClick={handleSavePreferences} disabled={isSaving} className="w-full">
              {isSaving ? "Saving..." : "Save Preferences"}
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Tailoring Mode Comparison</CardTitle>
            <CardDescription>
              Compare the different tailoring modes to understand which one best suits your needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Feature</th>
                    <th className="text-center py-2 px-3">Basic</th>
                    <th className="text-center py-2 px-3">Personalized</th>
                    <th className="text-center py-2 px-3">Aggressive</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-3 font-medium">Keyword Optimization</td>
                    <td className="text-center py-2 px-3">Light</td>
                    <td className="text-center py-2 px-3">Moderate</td>
                    <td className="text-center py-2 px-3">Heavy</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3 font-medium">Content Restructuring</td>
                    <td className="text-center py-2 px-3">Minimal</td>
                    <td className="text-center py-2 px-3">When Beneficial</td>
                    <td className="text-center py-2 px-3">Extensive</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3 font-medium">Preserves Original Voice</td>
                    <td className="text-center py-2 px-3">Completely</td>
                    <td className="text-center py-2 px-3">Mostly</td>
                    <td className="text-center py-2 px-3">Partially</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3 font-medium">ATS Optimization</td>
                    <td className="text-center py-2 px-3">Good</td>
                    <td className="text-center py-2 px-3">Better</td>
                    <td className="text-center py-2 px-3">Best</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Best For</td>
                    <td className="text-center py-2 px-3">Minor Tweaks</td>
                    <td className="text-center py-2 px-3">Most Job Applications</td>
                    <td className="text-center py-2 px-3">Competitive Roles</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
