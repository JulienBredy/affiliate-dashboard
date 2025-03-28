'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()

  // ✅ Redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        router.push('/') // Redirect to dashboard if already logged in
      }
    }

    checkSession()

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        router.push('/') // Redirect to dashboard after login
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6 bg-white rounded-2xl shadow p-8">
        <div className="flex flex-col items-center space-y-2">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dsb%20Logo-kK8fRE70odZMbRGWRdHDgPhLfnPnoG.png"
            alt="DSB Logo"
            className="h-8"
          />
          <h1 className="text-lg font-semibold text-[#0C2340]">Partner Login</h1>
          <p className="text-sm text-muted-foreground">Melde dich mit deiner E-Mail an</p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#0C2340',
                  brandAccent: '#0A1C33',
                },
                radii: {
                  inputBorderRadius: '0.75rem',
                  buttonBorderRadius: '0.75rem',
                }
              }
            }
          }}
          theme="default"
          localization={{
            variables: {
              sign_in: {
                email_label: 'E-Mail',
                password_label: 'Passwort',
                button_label: 'Anmelden',
              },
              sign_up: {
                email_label: 'E-Mail',
                password_label: 'Passwort',
                button_label: 'Konto erstellen',
              },
            }
          }}
          providers={[]}
          redirectTo={process.env.NEXT_PUBLIC_SITE_URL + '/'} // Ensures redirect to the homepage after successful login
        />
      </div>
    </div>
  )
}




















