"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, Sparkles, Download, Copy, Layers, Palette } from "lucide-react"

interface WelcomeModalProps {
  onClose: () => void
}

export function WelcomeModal({ onClose }: WelcomeModalProps) {
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: "Welcome to Resume Builder",
      description: "Create professional resumes with our easy-to-use builder.",
      icon: <FileText className="h-12 w-12 text-primary" />,
      content: (
        <div className="space-y-4">
          <p>Our resume builder helps you create professional, ATS-friendly resumes that stand out to employers.</p>
          <p>
            With real-time preview, AI assistance, and multiple export options, you'll have everything you need to land
            your dream job.
          </p>
        </div>
      ),
    },
    {
      title: "Key Features",
      description: "Discover what makes our resume builder special.",
      icon: <Sparkles className="h-12 w-12 text-primary" />,
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start space-x-2">
            <Download className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium">PDF Export</h4>
              <p className="text-sm text-muted-foreground">Download your resume as a professional PDF</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Copy className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium">Multiple Versions</h4>
              <p className="text-sm text-muted-foreground">Create different versions for different jobs</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium">AI Assistance</h4>
              <p className="text-sm text-muted-foreground">Get AI-powered content suggestions</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Layers className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium">Section Management</h4>
              <p className="text-sm text-muted-foreground">Add, remove, and reorder sections easily</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Palette className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium">Styling Options</h4>
              <p className="text-sm text-muted-foreground">Customize fonts, colors, and spacing</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Get Started",
      description: "Ready to create your professional resume?",
      icon: <FileText className="h-12 w-12 text-primary" />,
      content: (
        <div className="space-y-4">
          <p>Start by editing the default resume or create a new one from scratch.</p>
          <p>Use the left panel to edit sections and the right panel to preview your changes in real-time.</p>
          <p>Need help? Click the "AI Suggestions" button in any section for assistance.</p>
        </div>
      ),
    },
  ]

  const currentStep = steps[step]

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      onClose()
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">{currentStep.icon}</div>
          <DialogTitle className="text-2xl">{currentStep.title}</DialogTitle>
          <DialogDescription>{currentStep.description}</DialogDescription>
        </DialogHeader>

        <div className="py-6">{currentStep.content}</div>

        <div className="flex justify-center mt-4">
          {steps.map((_, index) => (
            <div key={index} className={`h-2 w-2 rounded-full mx-1 ${index === step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={step === 0}>
            Back
          </Button>
          <Button onClick={handleNext}>{step < steps.length - 1 ? "Next" : "Get Started"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
