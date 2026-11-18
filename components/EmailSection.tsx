'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { sendEmailToASP, syncEmailReplies, parseEmailWithAI } from '@/app/actions'
import { getGreeting, buildEmailText, EMAIL_SUBJECT } from '@/lib/email-template'
import type { ASP } from '@/lib/types'

interface Email {
  id: string
  direction: 'sent' | 'received'
  subject: string | null
  body_text: string | null
  from_address: string | null
  to_address: string | null
  email_date: string
  ai_parsed: boolean
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function EmailThread({ emails, onParseAI }: {
  emails: Email[]
  onParseAI: (id: string) => void
}) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (!emails.length) return null

  return (
    <div className="space-y-2 mt-4">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email Thread</h4>
      {emails.map(email => (
        <div
          key={email.id}
          className={`rounded-lg border text-sm ${
            email.direction === 'sent'
              ? 'border-slate-200 bg-slate-50'
              : 'border-emerald-200 bg-emerald-50'
          }`}
        >
          <button
            className="w-full text-left px-4 py-3 flex items-center justify-between gap-3"
            onClick={() => setExpanded(expanded === email.id ? null : email.id)}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                email.direction === 'sent'
                  ? 'bg-slate-200 text-slate-600'
                  : 'bg-emerald-200 text-emerald-700'
              }`}>
                {email.direction === 'sent' ? '→ Sent' : '← Reply'}
              </span>
              <span className="text-slate-700 truncate">{email.subject}</span>
            </div>
            <span className="shrink-0 text-xs text-slate-400">{formatDate(email.email_date)}</span>
          </button>

          {expanded === email.id && (
            <div className="px-4 pb-4 border-t border-slate-200">
              <pre className="mt-3 text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto">
                {email.body_text || '(no plain text body)'}
              </pre>
              {email.direction === 'received' && !email.ai_parsed && (
                <button
                  onClick={(e) => { e.stopPropagation(); onParseAI(email.id) }}
                  className="mt-3 px-3 py-1.5 text-xs font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Auto-fill CRM with AI
                </button>
              )}
              {email.direction === 'received' && email.ai_parsed && (
                <span className="mt-3 inline-flex items-center gap-1 text-xs text-purple-600 font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  AI parsed — fields updated below
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function EmailSection({ asp, initialEmails }: {
  asp: ASP
  initialEmails: Email[]
}) {
  const router = useRouter()
  const [emails, setEmails] = useState(initialEmails)
  useEffect(() => { setEmails(initialEmails) }, [initialEmails])
  const [showPreview, setShowPreview] = useState(false)
  const [isSending, startSend] = useTransition()
  const [isSyncing, startSync] = useTransition()
  const [isParsing, startParse] = useTransition()
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const hasSent = emails.some(e => e.direction === 'sent')
  const hasReplies = emails.some(e => e.direction === 'received')
  const greeting = getGreeting(asp.contact_person)
  const previewText = buildEmailText(greeting)

  function flash(text: string, type: 'success' | 'error') {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }

  function handleSend() {
    startSend(async () => {
      try {
        await sendEmailToASP(asp.id)
        flash('Email sent successfully', 'success')
        router.refresh()
      } catch (e) {
        flash(e instanceof Error ? e.message : 'Send failed', 'error')
      }
    })
  }

  function handleSync() {
    startSync(async () => {
      try {
        const result = await syncEmailReplies()
        flash(
          result.matched > 0
            ? `Found ${result.matched} new repl${result.matched === 1 ? 'y' : 'ies'}`
            : 'No new replies found',
          'success'
        )
        router.refresh()
      } catch (e) {
        flash(e instanceof Error ? e.message : 'Sync failed', 'error')
      }
    })
  }

  function handleParseAI(emailId: string) {
    startParse(async () => {
      try {
        await parseEmailWithAI(emailId)
        flash('CRM fields updated from reply', 'success')
        setEmails(prev => prev.map(e =>
          e.id === emailId ? { ...e, ai_parsed: true } : e
        ))
        router.refresh()
      } catch (e) {
        flash(e instanceof Error ? e.message : 'AI parse failed', 'error')
      }
    })
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Email Outreach</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {hasSent
              ? `Sent ${emails.filter(e => e.direction === 'sent').length} email${emails.filter(e => e.direction === 'sent').length > 1 ? 's' : ''}`
              : 'Not yet sent'}
            {hasReplies ? ` · ${emails.filter(e => e.direction === 'received').length} repl${emails.filter(e => e.direction === 'received').length === 1 ? 'y' : 'ies'} received` : ''}
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="px-3 py-1.5 text-xs font-medium bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors flex items-center gap-1.5"
        >
          <svg className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isSyncing ? 'Syncing…' : 'Sync Inbox'}
        </button>
      </div>

      <div className="p-5">
        {/* Status message */}
        {message && (
          <div className={`mb-4 px-3 py-2 rounded-lg text-xs font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Send area */}
        {!asp.email ? (
          <p className="text-sm text-slate-400 italic">No email address on record for this ASP.</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-500">To: <span className="text-slate-700 font-medium">{asp.email.split(',').map(e => e.trim()).join(', ')}</span></div>
                <div className="text-xs text-slate-500 mt-0.5">Subject: <span className="text-slate-700">{asp.name} - {EMAIL_SUBJECT}</span></div>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setShowPreview(p => !p)}
                  className="px-3 py-1.5 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  {showPreview ? 'Hide preview' : 'Preview email'}
                </button>
                <button
                  onClick={handleSend}
                  disabled={isSending || isParsing}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                    hasSent
                      ? 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {isSending ? 'Sending…' : hasSent ? 'Send Again' : 'Send Email'}
                </button>
              </div>
            </div>

            {showPreview && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto">
                  {previewText}
                </pre>
              </div>
            )}
          </div>
        )}

        <EmailThread emails={emails} onParseAI={handleParseAI} />
      </div>
    </div>
  )
}
