'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function MeineKundenPage() {
  const [partner, setPartner] = useState<any>(null)
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/login')
        return
      }

      const { data: partnerData } = await supabase
        .from('partners')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (!partnerData) {
        setLoading(false)
        return
      }

      setPartner(partnerData)

      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .eq('partner_id', partnerData.partner_id)

      setLeads(leadsData || [])
      setLoading(false)
    }

    fetchData()
  }, [router])

  if (loading) {
    return (
      <DashboardLayout partner={partner}>
        <main className="p-6 text-sm text-muted-foreground">⏳ Lade Partnerdaten...</main>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout partner={partner}>
      <main className="p-4 md:p-6 space-y-6">

        <div className="w-full max-w-full overflow-x-auto shadow-[var(--shadow-default)] hover:shadow-[var(--shadow-hover)] transition-shadow rounded-2xl">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Meine Kunden</CardTitle>
              <CardDescription>Alle deine Leads im Überblick</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>E-Mail</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Erstellt am</TableHead>
                      <TableHead className="text-right">Wert</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.length > 0 ? (
                      leads.map((lead, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{lead.name || '-'}</TableCell>
                          <TableCell>{lead.email || '-'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              lead.status === 'Lead' ? 'bg-blue-100 text-blue-800' :
                              lead.status === 'Abschluss' ? 'bg-green-100 text-green-800' :
                              lead.status === 'Verloren' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {lead.status || '-'}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">{(lead.potential_value?.toLocaleString("de-DE") || "0") + "\u00A0€"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                          Keine Kunden gefunden.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        
      </main>
    </DashboardLayout>
  )
}
