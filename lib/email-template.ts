import { EMAIL_SIGNATURE } from './signature'

export const EMAIL_SUBJECT = 'UAE eInvoicing - Pricing Enquiry'

export function getFirstName(contactPerson: string | null): string {
  if (!contactPerson) return 'there'
  return contactPerson.split(',')[0].trim().split(' ')[0]
}

export function buildEmailHtml(contactName: string): string {
  return `<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #000; margin: 0; padding: 0;">
  <p style="margin: 0 0 12px 0;">Hi ${contactName},</p>
  <p style="margin: 0 0 12px 0;">I found your details on the <em>"List and Contact Details of the Ministry of Finance eInvoicing Accredited Service Providers (ASPs)"</em>.</p>
  <p style="margin: 0 0 12px 0;">I represent a number of companies that I am consulting with regards to the implementation of eInvoicing. All of them are Phase 2, and will all likely be under 100 invoices per year. For now, can you please let me know the following:</p>
  <ul style="margin: 0 0 12px 0; padding-left: 20px;">
    <li style="margin-bottom: 8px;">What is your pricing for onboarding and platform fee for Manual input of invoices or Excel/CSV upload if less than 100 invoices per year? Please give Year one full cost, and then what the renewal is thereafter.</li>
    <li style="margin-bottom: 8px;">If we wanted to integrate our QuickBooks, please also provide for your pricing for this for Year One (inc onboarding etc), and the yearly renewal thereafter.</li>
    <li style="margin-bottom: 8px;">Do you offer a "freemium" option where we use your web portal with minimal support to enter our invoices which will be 10-20 a year max at no cost at all?</li>
  </ul>
  <p style="margin: 0 0 20px 0;">Many thanks,</p>
  ${EMAIL_SIGNATURE}
</body>
</html>`
}

export function buildEmailText(contactName: string): string {
  return `Hi ${contactName},

I found your details on the "List and Contact Details of the Ministry of Finance eInvoicing Accredited Service Providers (ASPs)".

I represent a number of companies that I am consulting with regards to the implementation of eInvoicing. All of them are Phase 2, and will all likely be under 100 invoices per year. For now, can you please let me know the following:

* What is your pricing for onboarding and platform fee for Manual input of invoices or Excel/CSV upload if less than 100 invoices per year? Please give Year one full cost, and then what the renewal is thereafter.

* If we wanted to integrate our QuickBooks, please also provide for your pricing for this for Year One (inc onboarding etc), and the yearly renewal thereafter.

* Do you offer a "freemium" option where we use your web portal with minimal support to enter our invoices which will be 10-20 a year max at no cost at all?

Many thanks,

Paul Winick
Fractional Chief of Staff | Executive Support to Founders & CEOs
Compass building - Al Hulaila, Al Hulaila Industrial Zone-FZ, Ras Al Khaimah, UAE
M: +971 58 505 0186 | paul@winick.co.uk | www.winick.co.uk`
}
