"use client"

import { Button } from "@/components/ui/button"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LucernaSunIcon } from "@/components/lucerna-sun-icon"
import { ProfileInfoCard } from "./profile-info-card"
import { SubscriptionUsageCard } from "./subscription-usage-card"
import { TemplatePreferenceCard } from "./template-preference-card"
import { SessionSecurityCard } from "./session-security-card"
import Link from "next/link"

interface ProfileClientProps {
  profile: any
}

export function ProfileClient({ profile }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState("account")

  return (
    <div className="container-wide py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <LucernaSunIcon size={32} glowing={true} />
          <h1 className="text-3xl font-serif">Your Profile</h1>
        </div>
        <p className="text-gray-600 mt-2">Manage your account settings, subscription, and preferences.</p>
      </div>

      <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <ProfileInfoCard profile={profile} />
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionUsageCard profile={profile} />
          <div className="mt-4">
            <Button asChild>
              <Link href="/pricing">View Pricing Plans</Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <TemplatePreferenceCard profile={profile} />
        </TabsContent>

        <TabsContent value="security">
          <SessionSecurityCard profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
