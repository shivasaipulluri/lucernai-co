"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardClient } from "@/components/dashboard/dashboard-client"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TailoringLabClient({ hasResumes }: { hasResumes: boolean }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState("history")

  useEffect(() => {
    const tabParam = searchParams.get("tab")
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  return (
    <Tabs
      value={activeTab}
      onValueChange={(val) => {
        setActiveTab(val)
        router.push(`/resume/lab?tab=${val}`)
      }}
      className="w-full"
    >
      <TabsList className="mb-8">
        <TabsTrigger value="history">Resume History</TabsTrigger>
        <TabsTrigger value="upload">Upload Resume</TabsTrigger>
      </TabsList>

      <TabsContent value="history">
        <DashboardContent hasResumes={hasResumes} />
      </TabsContent>

      <TabsContent value="upload">
        <DashboardClient hasResumes={hasResumes} />
      </TabsContent>
    </Tabs>
  )
}
