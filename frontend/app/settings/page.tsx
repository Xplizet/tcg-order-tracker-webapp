"use client"

import { useState } from "react"
import { AccountSettings } from "@/components/settings/account-settings"
import { DataSettings } from "@/components/settings/data-settings"
import { NotificationSettings } from "@/components/settings/notification-settings"

type Tab = "account" | "notifications" | "data"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("account")

  const tabs: { id: Tab; label: string }[] = [
    { id: "account", label: "Account" },
    { id: "notifications", label: "Notifications" },
    { id: "data", label: "Data" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
  )
}
