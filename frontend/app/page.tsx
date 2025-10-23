import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const { userId } = await auth()

  // If logged in, redirect to dashboard
  if (userId) {
    redirect('/dashboard')
  }

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6">
          TCG Order Tracker
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Track your TCG orders, manage payments, and analyze your collection across all devices.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/sign-up"
            className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Get Started
          </Link>
          <Link
            href="/sign-in"
            className="px-8 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="font-semibold text-lg mb-2">Track Orders</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Manage all your TCG orders in one place with detailed tracking
            </p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="font-semibold text-lg mb-2">Payment Tracking</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Never forget how much you owe with automatic calculations
            </p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="font-semibold text-lg mb-2">Analytics</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get insights on spending, profit margins, and more
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
