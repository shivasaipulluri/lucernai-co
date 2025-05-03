"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileEdit } from "lucide-react"
import Link from "next/link"

export function ResumeBuilderCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileEdit className="mr-2 h-5 w-5 text-primary" />
          Resume Builder
        </CardTitle>
        <CardDescription>Create professional resumes with our advanced editor</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Our resume builder allows you to create, customize, and download professional resumes. Choose from various
          templates, customize styling, and get AI-powered content suggestions.
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/resume/builder">
            <FileEdit className="mr-2 h-4 w-4" />
            Open Resume Builder
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
