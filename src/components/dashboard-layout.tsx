'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Users, LogOut, ChevronLeft, ChevronRight } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabaseClient"

type DashboardLayoutProps = {
  children: React.ReactNode
  partner?: { partner_id: string }
}

export default function DashboardLayout({ children, partner }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()

  const handleLogout = async () => {
    // Sign out and clear the session
    await supabase.auth.signOut()
    // Redirect to login page after sign out
    router.push("/login")
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between bg-[#0C2340] transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div>
          {/* Logo */}
          <div className="bg-white h-16 flex items-center justify-center px-4">
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dsb%20Logo-kK8fRE70odZMbRGWRdHDgPhLfnPnoG.png" alt="DSB Logo" className="h-8 w-auto" />
          </div>
          <Separator className="bg-[#1A3152] my-0" />

          {/* Navigation */}
          <nav className="space-y-1 px-3 py-4">
            <SidebarButton icon={Home} label="Dashboard" href="/" />
            <SidebarButton icon={Users} label="Meine Kunden" href="/kunden" />
          </nav>
        </div>

        {/* Bottom section: Only Logout at the bottom now */}
        <div className="p-4 space-y-3">
          <Button
            variant="ghost"
            className="w-full justify-start rounded-xl text-[var(--sidebar-primary-foreground)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-hover-text)] transition-colors"
            onClick={handleLogout}
            aria-label="Abmelden"
            title="Abmelden"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Abmelden
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6 shadow-sm">
          <div className="relative flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 z-50 md:hidden"
              onClick={toggleSidebar}
              aria-label="Sidebar ein-/ausblenden"
              title="Sidebar ein-/ausblenden"
            >
              {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </Button>
            <h1 className="ml-2 text-lg font-bold text-[#0C2340] md:text-xl">DSB.Orbit Partner Dashboard</h1>
          </div>
          {partner?.partner_id && (
            <div className="bg-[#0C2340] text-white text-sm px-3 py-1 rounded-xl">
              Partner ID: {partner.partner_id}
            </div>
          )}
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

function SidebarButton({ icon: Icon, label, href }: { icon: any; label: string; href: string }) {
  const router = useRouter()
  return (
    <Button
      variant="ghost"
      className="w-full justify-start rounded-xl text-[var(--sidebar-primary-foreground)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-hover-text)] transition-colors"
      onClick={() => router.push(href)}
    >
      <Icon className="mr-3 h-5 w-5" />
      {label}
    </Button>
  )
}
