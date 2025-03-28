// src/hooks/useAuthRedirect.ts
'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export function useAuthRedirect() {
  const router = useRouter()

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // If the session is null (user logs out), redirect to /login
      if (!session) {
        router.push('/login')
      }
    })

    // Clean up listener when component unmounts
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [router])
}



