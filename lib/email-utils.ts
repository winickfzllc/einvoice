import 'server-only'
import nodemailer from 'nodemailer'

export const EMAIL_USER = process.env.EMAIL_USER ?? 'paul@winick.co.uk'

export function createSmtpTransport() {
  return nodemailer.createTransport({
    host: 'smtp.hosts.co.uk',
    port: 465,
    secure: true,
    auth: {
      user: EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })
}

export function getImapConfig() {
  return {
    host: 'imap.hosts.co.uk',
    port: 993,
    secure: true,
    auth: {
      user: EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD ?? '',
    },
    logger: false as const,
  }
}
