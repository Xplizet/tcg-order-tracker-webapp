"use client"

import { useUser } from "@clerk/nextjs"

export function AccountSettings() {
  const { user } = useUser()

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-card text-card-foreground rounded-lg shadow p-6 border border-border">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Email
            </label>
            <div className="text-foreground">
              {user.primaryEmailAddress?.emailAddress}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              User ID
            </label>
            <div className="text-muted-foreground text-sm font-mono">
              {user.id}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Account Created
            </label>
            <div className="text-foreground">
              {new Date(user.createdAt!).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-lg shadow p-6 border border-border">
        <h2 className="text-xl font-semibold mb-4">Account Management</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Password</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Manage your password through your Clerk account.
            </p>
            <a
              href={`https://accounts.clerk.com/user`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-input rounded-lg text-sm font-medium text-foreground bg-card text-card-foreground hover:bg-muted/20"
            >
              Manage Account
            </a>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-red-700 mb-2">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.")) {
                  alert("Account deletion functionality will be implemented with full user deletion logic.")
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
