import { currentUser } from '@clerk/nextjs/server'
import { AddOrderForm } from '@/components/orders/add-order-form'
import { OrdersView } from '@/components/orders/orders-view'
import { NavBar } from '@/components/nav-bar'

export default async function DashboardPage() {
  const user = await currentUser()

  return (
    <>
      <NavBar />
      <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-background">
        <div className="max-w-7xl mx-auto">

        <div className="bg-card text-card-foreground rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6 border border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold">
                Welcome, {user?.firstName || 'User'}!
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Manage your TCG orders and track your inventory
              </p>
            </div>
            <AddOrderForm />
          </div>
        </div>

        <OrdersView />
        </div>
      </div>
    </>
  )
}
