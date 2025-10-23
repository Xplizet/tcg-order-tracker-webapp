"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { ThemeToggle } from "./theme-toggle"
import { Settings, LayoutDashboard, Shield } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useApi } from "@/lib/use-api"

interface NavBarProps {
  isAdmin?: boolean
}

export function NavBar({ isAdmin: isAdminProp }: NavBarProps) {
  const pathname = usePathname()
  const { apiRequest } = useApi()

  // Auto-detect admin status by checking if we can access admin settings
  const { data: adminSettings } = useQuery({
    queryKey: ["admin-check"],
    queryFn: () => apiRequest("/api/v1/admin/settings"),
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })

  // Use prop if provided, otherwise detect from API
  const isAdmin = isAdminProp ?? (adminSettings !== undefined && adminSettings !== null)

  const isActive = (path: string) => {
    return pathname === path
  }

  const navLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
    },
  ]

  if (isAdmin) {
    navLinks.push({
      href: "/admin",
      label: "Admin",
      icon: Shield,
    })
  }

  return (
    <nav className="bg-card text-card-foreground border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">TCG Order Tracker</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-center p-2 rounded-md transition-colors ${
                    isActive(link.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  title={link.label}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              )
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
