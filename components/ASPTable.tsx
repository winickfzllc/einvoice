'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { ASP, ASPStatus } from '@/lib/types'
import AddASPModal from './AddASPModal'

const STATUS_STYLES: Record<ASPStatus, string> = {
  pending: 'bg-slate-100 text-slate-600',
  contacted: 'bg-blue-100 text-blue-700',
  responded: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
}

function ResearchDot({ filled, label }: { filled: boolean; label: string }) {
  return (
    <span
      title={label}
      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
        filled
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-slate-100 text-slate-400'
      }`}
    >
      {label[1]}
    </span>
  )
}

type SortField = 'sort_order' | 'name' | 'status'
type SortDir = 'asc' | 'desc'

function exportCSV(asps: ASP[]) {
  const headers = [
    '#', 'Name', 'Accreditation #', 'Website', 'Contact Person', 'Email', 'Phone',
    'Status', 'Last Contacted',
    'Option 1 Freemium', 'Option 1 Invoice Limit', 'Option 1 Notes',
    'Option 2 Invoice Limit', 'Option 2 Year 1 Cost', 'Option 2 Renewal Cost', 'Option 2 Notes',
    'Option 3 Invoice Limit', 'Option 3 Year 1 Cost', 'Option 3 Renewal Cost', 'Option 3 Notes',
    'General Notes',
  ]
  const rows = asps.map(a => [
    a.sort_order ?? '',
    a.name,
    a.accreditation_number ?? '',
    a.website ?? '',
    a.contact_person ?? '',
    a.email ?? '',
    a.phone ?? '',
    a.status,
    a.last_contacted ?? '',
    a.q1_freemium == null ? '' : a.q1_freemium ? 'Yes' : 'No',
    a.q1_invoice_limit ?? '',
    a.q1_notes ?? '',
    a.q2_invoice_limit ?? '',
    a.q2_year1_cost ?? '',
    a.q2_renewal_cost ?? '',
    a.q2_notes ?? '',
    a.q3_invoice_limit ?? '',
    a.q3_year1_cost ?? '',
    a.q3_renewal_cost ?? '',
    a.q3_notes ?? '',
    a.general_notes ?? '',
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'uae-einvoice-asps.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function ASPTable({ asps }: { asps: ASP[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ASPStatus | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('sort_order')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [showAddModal, setShowAddModal] = useState(false)

  const stats = useMemo(() => ({
    total: asps.length,
    pending: asps.filter(a => a.status === 'pending').length,
    contacted: asps.filter(a => a.status === 'contacted' || a.status === 'responded').length,
    responded: asps.filter(a => a.status === 'responded').length,
    completed: asps.filter(a => a.status === 'completed').length,
  }), [asps])

  const filtered = useMemo(() => {
    let result = asps
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(a =>
        a.name.toLowerCase().includes(q) ||
        (a.contact_person ?? '').toLowerCase().includes(q) ||
        (a.email ?? '').toLowerCase().includes(q) ||
        (a.website ?? '').toLowerCase().includes(q) ||
        (a.accreditation_number ?? '').includes(q)
      )
    }
    if (statusFilter !== 'all') {
      result = result.filter(a => a.status === statusFilter)
    }
    return [...result].sort((a, b) => {
      let cmp = 0
      if (sortField === 'sort_order') cmp = (a.sort_order ?? Infinity) - (b.sort_order ?? Infinity)
      else if (sortField === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortField === 'status') cmp = a.status.localeCompare(b.status)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [asps, search, statusFilter, sortField, sortDir])

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <span className="text-slate-300 ml-1">↕</span>
    return <span className="text-slate-600 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'bg-white border-slate-200 text-slate-700' },
          { label: 'Pending', value: stats.pending, color: 'bg-white border-slate-200 text-slate-500' },
          { label: 'Contacted', value: stats.contacted, color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Responded', value: stats.responded, color: 'bg-amber-50 border-amber-200 text-amber-700' },
          { label: 'Completed', value: stats.completed, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-lg border px-4 py-3 ${s.color}`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs font-medium mt-0.5 opacity-70">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'contacted', 'responded', 'completed'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s === 'all' ? 'All ASPs' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search name, contact, email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 sm:w-64 px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <button
            onClick={() => exportCSV(filtered)}
            className="px-3 py-1.5 text-xs font-medium bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            Export CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
          >
            + Add ASP
          </button>
        </div>
      </div>

      {showAddModal && <AddASPModal onClose={() => setShowAddModal(false)} />}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th
                  className="text-left px-4 py-3 font-medium text-slate-500 cursor-pointer hover:text-slate-700 w-10"
                  onClick={() => toggleSort('sort_order')}
                >
                  # <SortIcon field="sort_order" />
                </th>
                <th
                  className="text-left px-4 py-3 font-medium text-slate-500 cursor-pointer hover:text-slate-700 min-w-[200px]"
                  onClick={() => toggleSort('name')}
                >
                  ASP Name <SortIcon field="name" />
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 w-28">Accrdn #</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 min-w-[140px]">Website</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 min-w-[160px]">Contact</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 min-w-[160px]">Email</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 w-32">Phone</th>
                <th
                  className="text-left px-4 py-3 font-medium text-slate-500 cursor-pointer hover:text-slate-700 w-28"
                  onClick={() => toggleSort('status')}
                >
                  Status <SortIcon field="status" />
                </th>
                <th className="text-center px-4 py-3 font-medium text-slate-500 w-24">Research</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    No ASPs found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map(asp => (
                  <tr
                    key={asp.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3 text-slate-400 text-xs font-mono">{asp.sort_order}</td>
                    <td className="px-4 py-3">
                      <Link href={`/asps/${asp.id}`} className="font-medium text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {asp.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs font-mono">{asp.accreditation_number}</td>
                    <td className="px-4 py-3 text-xs">
                      {asp.website ? (
                        <a
                          href={`https://${asp.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate block max-w-[150px]"
                          onClick={e => e.stopPropagation()}
                        >
                          {asp.website}
                        </a>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs max-w-[180px]">
                      <span className="truncate block">{asp.contact_person ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {asp.email ? (
                        <a
                          href={`mailto:${asp.email}`}
                          className="text-blue-600 hover:underline truncate block max-w-[180px]"
                          onClick={e => e.stopPropagation()}
                        >
                          {asp.email}
                        </a>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{asp.phone ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[asp.status as ASPStatus]}`}>
                        {asp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-center">
                        <ResearchDot
                          filled={asp.q1_freemium !== null}
                          label="O1"
                        />
                        <ResearchDot
                          filled={!!(asp.q2_year1_cost || asp.q2_renewal_cost)}
                          label="O2"
                        />
                        <ResearchDot
                          filled={!!(asp.q3_year1_cost || asp.q3_renewal_cost)}
                          label="O3"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
          Showing {filtered.length} of {asps.length} ASPs
        </div>
      </div>
    </div>
  )
}
