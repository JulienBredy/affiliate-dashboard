'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'

import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

// Define the structure of a Lead
interface Lead {
  id: string;
  name: string;
  email: string;
  status: string;
  potential_value: number;
  created_at: string;
  partner_id: string;
}

export default function HomePage() {
  useAuthRedirect() // ✅ This now ONLY listens for real auth changes

  const [partner, setPartner] = useState<any>(null)
  const [leads, setLeads] = useState<Lead[]>([]) // Use the correct type here
  const [loading, setLoading] = useState(true)
  const [activeStatus, setActiveStatus] = useState<string | null>(null)

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
    dimmed: activeStatus !== null && activeStatus !== status
  }))

  // Calculate total Umsatz for leads with status "Abschluss"
  const totalLeadValue = leads
    .filter((lead) => lead.status === 'Abschluss') // Only include leads with status "Abschluss"
    .reduce((sum, lead) => sum + (lead.potential_value || 0), 0) // Sum their potential values

  const maxLeads = Math.max(...funnelData.map((entry) => entry.leads), 1)
  const dynamicTickCount = Math.min(maxLeads + 1, 10)

  return (
    <DashboardLayout partner={partner}>
      <main className="p-4 md:p-6 space-y-6">
        {/* ✅ TOP SECTION */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="shadow-[var(--shadow-default)] hover:shadow-[var(--shadow-hover)] transition-shadow rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Gesamtumsatz</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0C2340]">{totalLeadValue.toLocaleString('de-DE') + '\u00A0€'}</div>
              <p className="text-xs text-muted-foreground">Wert aller Leads mit Status &quot;Abschluss&quot;</p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-default)] hover:shadow-[var(--shadow-hover)] transition-shadow rounded-2xl">
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="shadow-[var(--shadow-default)] hover:shadow-[var(--shadow-hover)] transition-shadow rounded-2xl">
            <CardHeader>
              <CardTitle>Kunden im Funnel</CardTitle>
              <CardDescription>Lead-Verteilung pro Status</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 20 }} barSize={20}>
                    <XAxis 
                      type="number" 
                      allowDecimals={false}
                      tickCount={dynamicTickCount}
                      label={{ value: 'Leads', position: 'insideBottom', offset: -5, textAnchor: 'middle' }} 
                    />
                    <YAxis type="category" dataKey="stage" width={100} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length > 0) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white px-3 py-1 border rounded text-sm shadow">
                              {`${data.stage} (${data.leads})`}
                            </div>
                          )
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="leads" radius={[0, 4, 4, 0]}>
                      {funnelData.map((entry) => (
                        <Cell
                          key={`bar-${entry.stage}`}
                          fill={entry.stage === 'Lead' ? '#102C54' : entry.stage === 'Abschluss' ? '#13AA6C' : '#B00020'}
                          fillOpacity={entry.dimmed ? 0.5 : 1}
                          onClick={() => setActiveStatus(entry.stage === activeStatus ? null : entry.stage)}
                          style={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-default)] hover:shadow-[var(--shadow-hover)] transition-shadow rounded-2xl">
            <CardHeader>
              <CardTitle>Statusübersicht</CardTitle>
              <CardDescription>Verteilung der Leads nach Status</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart className="focus:outline-none">
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length > 0) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white px-3 py-1 border rounded text-sm shadow">
                              {`${data.stage} (${data.leads})`}
                            </div>
                          )
                        }
                        return null;
                      }}
                    />
                    <Legend
                      content={() => (
                        <div className="flex justify-center mt-4 space-x-4 text-sm">
                          {funnelData.map((entry) => (
                            <div
                              key={entry.stage}
                              className={`flex items-center space-x-1 cursor-pointer ${entry.dimmed ? 'opacity-50' : ''}`}
                              onClick={() => setActiveStatus(entry.stage === activeStatus ? null : entry.stage)}
                            >
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    entry.stage === 'Lead'
                                      ? '#102C54'
                                      : entry.stage === 'Abschluss'
                                      ? '#13AA6C'
                                      : '#B00020',
                                }}
                              />
                              <span>{`${entry.stage}`}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    />
                    <Pie data={funnelData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="leads">
                      {funnelData.map((entry) => (
                        <Cell
                          key={entry.stage}
                          fill={entry.stage === 'Lead' ? '#102C54' : entry.stage === 'Abschluss' ? '#13AA6C' : '#B00020'}
                          fillOpacity={entry.dimmed ? 0.5 : 1}
                          onClick={() => setActiveStatus(entry.stage === activeStatus ? null : entry.stage)}
                          style={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ✅ TABLE */}
        <Card className="mt-6 shadow-[var(--shadow-default)] hover:shadow-[var(--shadow-hover)] transition-shadow rounded-2xl">
          <CardHeader>
            <CardTitle>Kunden</CardTitle>
            <CardDescription>Alle deine Leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-x-auto">
              <Table>
                <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>E-mail</TableHead>
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
                    <TableRow key={index} className={activeStatus && lead.status !== activeStatus ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">{lead.name || '-'}</TableCell>
                      <TableCell>{lead.email || '-'}</TableCell>
                      <TableCell>
                        <span
                          onClick={() => setActiveStatus(lead.status === activeStatus ? null : lead.status)}
                          className={`px-2 py-1 text-xs font-medium rounded-full cursor-pointer transition-opacity hover:opacity-80 ${statusColors[lead.status] || 'bg-gray-100 text-gray-800'}`}
                          title="Nach diesem Status filtern"
                        >
                          {lead.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">{(lead.potential_value?.toLocaleString('de-DE') || '0') + '\u00A0€'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  )
}
