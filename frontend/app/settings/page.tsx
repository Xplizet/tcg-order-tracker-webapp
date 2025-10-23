"use client"

import { useState } from "react"
import { AccountSettings } from "@/components/settings/account-settings"
import { DataSettings } from "@/components/settings/data-settings"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { NavBar } from "@/components/nav-bar"

type Tab = "account" | "notifications" | "data"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("account")

  const tabs: { id: Tab; label: string }[] = [
    { id: "account", label: "Account" },
    { id: "notifications", label: "Notifications" },
    { id: "data", label: "Data" },
  ]

  return (
    <>
      <NavBar />
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 bg-background min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-foreground">Settings</h1>

      {/* Tab Navigation */}
      <div className="border-b border-border mb-6">
        <nav className="flex space-x-6 sm:space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl">
        {activeTab === "account" && <AccountSettings />}
        {activeTab === "notifications" && <NotificationSettings />}
        {activeTab === "data" && <DataSettings />}
      </div>
      </div>
    </>
  )
}
