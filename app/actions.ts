'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import type { ASPUpdate } from '@/lib/types'
import { createSmtpTransport, getImapConfig, EMAIL_USER } from '@/lib/email-utils'
import { getFirstName, buildEmailHtml, buildEmailText, EMAIL_SUBJECT } from '@/lib/email-template'

export async function updateASP(id: string, data: ASPUpdate) {
  const { error } = await supabase
    .from('asps')
    .update(data)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath(`/asps/${id}`)
}

export async function getASPs() {
  const { data, error } = await supabase
    .from('asps')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function getASP(id: string) {
  const { data, error } = await supabase
    .from('asps')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getEmails(aspId: string) {
  const { data, error } = await supabase
    .from('emails')
    .select('*')
    .eq('asp_id', aspId)
    .order('email_date', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function sendEmailToASP(aspId: string) {
  const asp = await getASP(aspId)
  if (!asp.email) throw new Error('No email address for this ASP')

  const firstName = getFirstName(asp.contact_person)
  const transport = createSmtpTransport()
  const subject = EMAIL_SUBJECT

  const mailOptions = {
    from: `Paul Winick <${EMAIL_USER}>`,
    to: asp.email,
    subject,
    text: buildEmailText(firstName),
    html: buildEmailHtml(firstName),
  }

  const info = await transport.sendMail(mailOptions)
  const messageId = (info.messageId as string | undefined)?.replace(/[<>]/g, '') ?? null

  // Append a copy to the Sent folder via IMAP
  try {
    const { ImapFlow } = await import('imapflow')
    // @ts-ignore — subpath import, no types
    const MailComposer = (await import('nodemailer/lib/mail-composer')).default
    const rawMessage = await new Promise<Buffer>((resolve, reject) => {
      new MailComposer(mailOptions).compile().build((err: Error | null, buf: Buffer) => {
        if (err) reject(err); else resolve(buf)
      })
    })
    const imap = new ImapFlow(getImapConfig())
    await imap.connect()
    try {
      const mailboxes = await imap.list()
      const sentPath = (mailboxes as any[]).find(m => m.specialUse === '\\Sent')?.path ?? 'Sent'
      await imap.append(sentPath, rawMessage, ['\\Seen'], new Date())
    } finally {
      await imap.logout()
    }
  } catch (err) {
    console.error('Sent folder append failed (non-fatal):', err)
  }

  await supabase.from('emails').insert({
    asp_id: aspId,
    direction: 'sent',
    subject,
    body_text: buildEmailText(firstName),
    body_html: buildEmailHtml(firstName),
    from_address: EMAIL_USER,
    to_address: asp.email,
    message_id: messageId,
    email_date: new Date().toISOString(),
  })

  await supabase.from('asps').update({
    status: 'contacted',
    last_contacted: new Date().toISOString().split('T')[0],
  }).eq('id', aspId)

  revalidatePath('/')
  revalidatePath(`/asps/${aspId}`)
  return { ok: true, messageId }
}

export async function syncEmailReplies() {
  const { ImapFlow } = await import('imapflow')
  const { simpleParser } = await import('mailparser')

  const { data: asps } = await supabase
    .from('asps')
    .select('id, email')
    .not('email', 'is', null)

  if (!asps?.length) return { matched: 0 }

  const emailToAspId = new Map(
    asps.map(a => [a.email!.toLowerCase().trim(), a.id])
  )

  const { data: sentEmails } = await supabase
    .from('emails')
    .select('message_id, asp_id')
    .eq('direction', 'sent')
    .not('message_id', 'is', null)

  const msgIdToAspId = new Map(
    sentEmails?.map(e => [e.message_id!, e.asp_id]) ?? []
  )

  const client = new ImapFlow(getImapConfig())
  await client.connect()

  let matched = 0

  try {
    const lock = await client.getMailboxLock('INBOX')
    try {
      const since = new Date()
      since.setDate(since.getDate() - 90)
      const rawUids = await client.search({ since, seen: false }, { uid: true })
      const uids: number[] = Array.isArray(rawUids) ? rawUids : []

      if (!uids.length) return { matched: 0 }

      for await (const msg of client.fetch(uids, { source: true }, { uid: true })) {
        if (!msg.source) continue
        const parsed = await simpleParser(Buffer.from(msg.source))

        const fromAddress = parsed.from?.value?.[0]?.address?.toLowerCase().trim()
        const rawMsgId = parsed.messageId?.replace(/[<>]/g, '').trim()
        const rawInReplyTo = parsed.inReplyTo?.replace(/[<>]/g, '').trim()

        if (rawMsgId) {
          const { data: existing } = await supabase
            .from('emails')
            .select('id')
            .eq('message_id', rawMsgId)
            .maybeSingle()
          if (existing) continue
        }

        let aspId: string | null = null

        if (fromAddress && emailToAspId.has(fromAddress)) {
          aspId = emailToAspId.get(fromAddress)!
        }
        if (!aspId && rawInReplyTo && msgIdToAspId.has(rawInReplyTo)) {
          aspId = msgIdToAspId.get(rawInReplyTo)!
        }
        if (!aspId) {
          const refs: string[] = Array.isArray(parsed.references)
            ? parsed.references as string[]
            : typeof parsed.references === 'string' ? [parsed.references] : []
          for (const ref of refs) {
            const r = ref.replace(/[<>]/g, '').trim()
            if (msgIdToAspId.has(r)) { aspId = msgIdToAspId.get(r)!; break }
          }
        }

        if (!aspId) continue

        await supabase.from('emails').insert({
          asp_id: aspId,
          direction: 'received',
          subject: parsed.subject ?? '',
          body_text: parsed.text ?? '',
          body_html: typeof parsed.html === 'string' ? parsed.html : '',
          from_address: fromAddress ?? '',
          to_address: EMAIL_USER,
          message_id: rawMsgId ?? null,
          in_reply_to: rawInReplyTo ?? null,
          email_date: (parsed.date ?? new Date()).toISOString(),
        })

        await supabase.from('asps').update({
          status: 'responded',
          last_contacted: (parsed.date ?? new Date()).toISOString().split('T')[0],
        }).eq('id', aspId)

        matched++
      }
    } finally {
      lock.release()
    }
  } finally {
    await client.logout()
  }

  revalidatePath('/')
  return { matched }
}

export async function parseEmailWithAI(emailId: string) {
  const { data: email } = await supabase
    .from('emails')
    .select('*, asp_id')
    .eq('id', emailId)
    .single()

  if (!email) throw new Error('Email not found')

  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const bodyToAnalyse = email.body_text || email.body_html?.replace(/<[^>]+>/g, ' ') || ''

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `You are extracting pricing data from an email reply sent by a UAE eInvoicing provider.

Return ONLY valid JSON (no explanation) with these fields — use null for anything not mentioned:
{
  "q1_freemium": true/false/null,
  "q1_invoice_limit": "string or null",
  "q1_notes": "string or null",
  "q2_invoice_limit": "string or null",
  "q2_year1_cost": "string or null",
  "q2_renewal_cost": "string or null",
  "q2_notes": "string or null",
  "q3_invoice_limit": "string or null",
  "q3_year1_cost": "string or null",
  "q3_renewal_cost": "string or null",
  "q3_notes": "string or null"
}

Definitions:
- q1 = freemium/free tier
- q2 = manual input / CSV / Excel upload pricing
- q3 = QuickBooks or ERP integration pricing

Email body:
${bodyToAnalyse}`,
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI did not return valid JSON')

  const extracted = JSON.parse(jsonMatch[0])

  await supabase.from('asps').update(extracted).eq('id', email.asp_id)
  await supabase.from('emails').update({ ai_parsed: true }).eq('id', emailId)

  revalidatePath('/')
  revalidatePath(`/asps/${email.asp_id}`)

  return extracted
}
