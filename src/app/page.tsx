'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'

import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function HomePage() {
  useAuthRedirect() // ✅ This now ONLY listens for real auth changes

  const [partner, setPartner] = useState<any>(null)
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

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
  }, [])

  if (loading) {
    return (
      <DashboardLayout partner={partner}>
        <main className="p-6 text-sm text-muted-foreground">⏳ Lade Partnerdaten...</main>
      </DashboardLayout>
    )
  }

  const statusColors: Record<string, string> = {
    Lead: 'bg-blue-100 text-blue-800',
    Abschluss: 'bg-green-100 text-green-800',
    Verloren: 'bg-red-100 text-red-800',
  }

  const funnelData = ['Lead', 'Abschluss', 'Verloren'].map(status => ({
    stage: status,
    leads: leads.filter((l) => l.status === status).length,
  }))

  // Calculate total Umsatz for leads with status "Abschluss"
  const totalLeadValue = leads
    .filter((lead) => lead.status === 'Abschluss') // Only include leads with status "Abschluss"
    .reduce((sum, lead) => sum + (lead.potential_value || 0), 0) // Sum their potential values

  return (
    <DashboardLayout partner={partner}>
      <main className="p-4 md:p-6 space-y-6">
        {/* ✅ TOP SECTION */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="shadow-sm rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Gesamtumsatz</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0C2340]">€{totalLeadValue.toLocaleString('de-DE')}</div>
              <p className="text-xs text-muted-foreground">Wert aller Leads mit Status "Abschluss"</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Vermittelte Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0C2340]">{leads.length}</div>
              <p className="text-xs text-muted-foreground">Gesamtzahl der Leads</p>
            </CardContent>
          </Card>
        </div>

        {/* ✅ CHARTS */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle>Kunden im Funnel</CardTitle>
              <CardDescription>Lead-Verteilung pro Status</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 20 }} barSize={20}>
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="stage" width={100} />
                    <Bar dataKey="leads" fill="#0C2340" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle>Statusübersicht</CardTitle>
              <CardDescription>Verteilung der Leads nach Status</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={funnelData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="leads">
                      {funnelData.map((entry) => (
                        <Cell key={entry.stage} fill={entry.stage === 'Lead' ? '#3B82F6' : entry.stage === 'Abschluss' ? '#10B981' : '#EF4444'} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ✅ TABLE */}
        <Card className="mt-6 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle>Kunden</CardTitle>
            <CardDescription>Alle deine Leads</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Erstellt am</TableHead>
                  <TableHead className="text-right">Wert</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">Keine Leads gefunden</TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{lead.name || '-'}</TableCell>
                      <TableCell>{lead.email || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[lead.status] || 'bg-gray-100 text-gray-800'}`}>
                          {lead.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">€{lead.potential_value?.toLocaleString('de-DE') || '0'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  )
}








