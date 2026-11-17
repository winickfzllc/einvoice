'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { updateASP, deleteASP } from '@/app/actions'
import EmailSection from '@/components/EmailSection'
import type { ASP, ASPStatus } from '@/lib/types'

const STATUS_STYLES: Record<ASPStatus, string> = {
  pending: 'bg-slate-100 text-slate-700 border-slate-200',
  contacted: 'bg-blue-50 text-blue-700 border-blue-200',
  responded: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

function Section({ title, description, children }: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
        <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {hint && <p className="text-xs text-slate-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  )
}

const inputClass = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-300"
const textareaClass = `${inputClass} resize-none`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ASPDetailForm({ asp, emails }: { asp: ASP; emails: any[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [form, setForm] = useState({
    status: asp.status as ASPStatus,
    last_contacted: asp.last_contacted ?? '',
    q1_freemium: asp.q1_freemium,
    q1_invoice_limit: asp.q1_invoice_limit ?? '',
    q1_notes: asp.q1_notes ?? '',
    q2_invoice_limit: asp.q2_invoice_limit ?? '',
    q2_year1_cost: asp.q2_year1_cost ?? '',
    q2_renewal_cost: asp.q2_renewal_cost ?? '',
    q2_notes: asp.q2_notes ?? '',
    q3_invoice_limit: asp.q3_invoice_limit ?? '',
    q3_year1_cost: asp.q3_year1_cost ?? '',
    q3_renewal_cost: asp.q3_renewal_cost ?? '',
    q3_notes: asp.q3_notes ?? '',
    general_notes: asp.general_notes ?? '',
  })

  function set(field: keyof typeof form, value: string | boolean | null) {
    setForm(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      try {
        await updateASP(asp.id, {
          ...form,
          last_contacted: form.last_contacted || null,
          q1_invoice_limit: form.q1_invoice_limit || null,
          q1_notes: form.q1_notes || null,
          q2_invoice_limit: form.q2_invoice_limit || null,
          q2_year1_cost: form.q2_year1_cost || null,
          q2_renewal_cost: form.q2_renewal_cost || null,
          q2_notes: form.q2_notes || null,
          q3_invoice_limit: form.q3_invoice_limit || null,
          q3_year1_cost: form.q3_year1_cost || null,
          q3_renewal_cost: form.q3_renewal_cost || null,
          q3_notes: form.q3_notes || null,
          general_notes: form.general_notes || null,
        })
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Save failed')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-800 transition-colors">← All ASPs</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 font-medium truncate max-w-[300px]">{asp.name}</span>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved
            </span>
          )}
          {error && <span className="text-xs text-red-600">{error}</span>}
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">Delete this ASP?</span>
              <button
                onClick={() => startTransition(async () => {
                  await deleteASP(asp.id)
                  router.push('/')
                })}
                disabled={isPending}
                className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Yes, delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* ASP header card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{asp.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">Accreditation #{asp.accreditation_number}</p>
          </div>
          <select
            value={form.status}
            onChange={e => set('status', e.target.value as ASPStatus)}
            className={`text-sm font-medium border rounded-full px-3 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer ${STATUS_STYLES[form.status]}`}
          >
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="responded">Responded</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100">
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">Website</div>
            {asp.website ? (
              <a href={`https://${asp.website}`} target="_blank" rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline mt-1 block truncate">
                {asp.website}
              </a>
            ) : <div className="text-sm text-slate-300 mt-1">—</div>}
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">Contact Person</div>
            <div className="text-sm text-slate-700 mt-1">{asp.contact_person ?? '—'}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">Email</div>
            {asp.email ? (
              <a href={`mailto:${asp.email}`} className="text-sm text-blue-600 hover:underline mt-1 block truncate">
                {asp.email}
              </a>
            ) : <div className="text-sm text-slate-300 mt-1">—</div>}
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">Phone</div>
            <div className="text-sm text-slate-700 mt-1">{asp.phone ?? '—'}</div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <Field label="Last Contacted Date">
            <input
              type="date"
              value={form.last_contacted}
              onChange={e => set('last_contacted', e.target.value)}
              className={`${inputClass} w-auto`}
            />
          </Field>
        </div>
      </div>

      {/* Email outreach */}
      <EmailSection asp={asp} initialEmails={emails} />

      {/* Option 1: Freemium */}
      <Section
        title="Option 1 — Freemium"
        description="Do they offer a free tier? If so, how many invoices are included at no cost?"
      >
        <Field label="Freemium Available?">
          <div className="flex gap-3">
            {([true, false, null] as const).map(val => (
              <button
                key={String(val)}
                onClick={() => set('q1_freemium', val)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  form.q1_freemium === val
                    ? val === true
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : val === false
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {val === true ? 'Yes' : val === false ? 'No' : 'Unknown'}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Invoice Limit on Free Tier" hint="How many invoices/documents are included at no cost?">
          <input
            type="text"
            placeholder="e.g. 120 documents/year (incoming + outgoing combined)"
            value={form.q1_invoice_limit}
            onChange={e => set('q1_invoice_limit', e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Notes">
          <textarea
            rows={3}
            placeholder="e.g. Includes manual portal entry and XML upload. No Excel upload on free tier."
            value={form.q1_notes}
            onChange={e => set('q1_notes', e.target.value)}
            className={textareaClass}
          />
        </Field>
      </Section>

      {/* Option 2: Manual / CSV */}
      <Section
        title="Option 2 — Manual Input / CSV Upload"
        description="Pricing for onboarding and platform fee for manual input or Excel/CSV upload."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Invoice Limit (base tier)" hint="Number of invoices included at the quoted price">
            <input
              type="text"
              placeholder="e.g. 2,000 invoices/year"
              value={form.q2_invoice_limit}
              onChange={e => set('q2_invoice_limit', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Year 1 Full Cost (inc. onboarding)" hint="All-in cost for year one">
            <input
              type="text"
              placeholder="e.g. AED 500/year"
              value={form.q2_year1_cost}
              onChange={e => set('q2_year1_cost', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Annual Renewal Cost" hint="Ongoing cost from year 2+">
            <input
              type="text"
              placeholder="e.g. AED 500/year"
              value={form.q2_renewal_cost}
              onChange={e => set('q2_renewal_cost', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Additional Notes" hint="Higher tiers, volume pricing, or other conditions">
          <textarea
            rows={3}
            placeholder="e.g. Starter Plus: AED 1,500/year for up to 6,000 invoices. Starter Basic: AED 500/year for up to 2,000."
            value={form.q2_notes}
            onChange={e => set('q2_notes', e.target.value)}
            className={textareaClass}
          />
        </Field>
      </Section>

      {/* Option 3: Integration */}
      <Section
        title="Option 3 — Integration (QuickBooks / ERP)"
        description="Pricing for QuickBooks or ERP integration including Year 1 (inc. onboarding) and annual renewal thereafter."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Invoice Limit (base tier)" hint="Number of invoices included at the quoted price">
            <input
              type="text"
              placeholder="e.g. Unlimited / 10,000 invoices/year"
              value={form.q3_invoice_limit}
              onChange={e => set('q3_invoice_limit', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Year 1 Full Cost (inc. onboarding)" hint="All-in cost for year one with integration">
            <input
              type="text"
              placeholder="e.g. AED 6,000/year"
              value={form.q3_year1_cost}
              onChange={e => set('q3_year1_cost', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Annual Renewal Cost" hint="Ongoing cost from year 2+">
            <input
              type="text"
              placeholder="e.g. AED 6,000/year"
              value={form.q3_renewal_cost}
              onChange={e => set('q3_renewal_cost', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Additional Notes" hint="Higher tiers, volume pricing, or other conditions">
          <textarea
            rows={3}
            placeholder="e.g. Native QuickBooks connector. Setup takes 2-3 days."
            value={form.q3_notes}
            onChange={e => set('q3_notes', e.target.value)}
            className={textareaClass}
          />
        </Field>
      </Section>

      {/* General Notes */}
      <Section title="General Notes">
        <Field label="Notes & Observations">
          <textarea
            rows={4}
            placeholder="Any general notes, follow-up actions, or additional context…"
            value={form.general_notes}
            onChange={e => set('general_notes', e.target.value)}
            className={textareaClass}
          />
        </Field>
      </Section>

      {/* Save footer */}
      <div className="flex justify-end pb-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
