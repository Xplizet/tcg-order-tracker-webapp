import { UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { AddPreorderForm } from '@/components/preorders/add-preorder-form'
import { PreorderTable } from '@/components/preorders/preorder-table'

export default async function DashboardPage() {
  const user = await currentUser()

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">TCG Preorder Tracker</h1>
          <UserButton />
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">
                Welcome, {user?.firstName || 'User'}!
              </h2>
              <p className="text-gray-600 mt-1">
                Manage your TCG preorders and track your inventory
              </p>
            </div>
            <AddPreorderForm />
          </div>
        </div>

        <PreorderTable />
      </div>
    </div>
  )
}
