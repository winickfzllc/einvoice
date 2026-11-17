const LOGO_URL = 'https://mpspvwacishcnrcfevun.supabase.co/storage/v1/object/public/assets/signature/logo.png'
const BANNER_URL = 'https://mpspvwacishcnrcfevun.supabase.co/storage/v1/object/public/assets/signature/banner.jpg'

export const EMAIL_SIGNATURE = `
<div style="font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #212121;">
  <p style="margin: 0 0 8px 0; font-family: Aptos, Arial, sans-serif; font-size: 12pt; color: #000;">Regards,</p>

  <table cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
    <tr>
      <td style="padding: 0 8px 0 0; border-right: 1pt solid #000; vertical-align: middle;">
        <img src="${LOGO_URL}" alt="Paul Winick" width="160" style="display:block; max-width:160px;" />
      </td>
      <td style="padding: 0 0 0 12px; vertical-align: top;">
        <div style="font-family: Calibri, sans-serif; font-size: 11pt; font-weight: bold; color: #0c64c0; margin: 0;">Paul Winick</div>
        <div style="font-family: Calibri, sans-serif; font-size: 11pt; color: #0c64c0; margin: 2px 0 0 0;">Fractional Chief of Staff | Executive Support to Founders &amp; CEOs</div>
      </td>
    </tr>
  </table>

  <p style="margin: 6px 0 2px 0; font-family: Calibri, sans-serif; font-size: 9pt; color: #676567;">
    Compass building - Al Hulaila, Al Hulaila Industrial Zone-FZ, Ras Al Khaimah, United Arab Emirates
  </p>

  <p style="margin: 2px 0 8px 0; font-family: Calibri, sans-serif; font-size: 9pt; color: #676567;">
    M: <a href="tel:+971585050186" style="color: #0078d7; text-decoration: none;">+971 58 505 0186</a>
    &nbsp;|&nbsp;
    M: <a href="mailto:paul@winick.co.uk" style="color: #0563c1; text-decoration: none;">paul@winick.co.uk</a>
    &nbsp;|&nbsp;
    W: <a href="http://www.winick.co.uk" style="color: #0563c1; text-decoration: none;">www.winick.co.uk</a>
  </p>

  <img src="${BANNER_URL}" alt="" width="502" style="display:block; max-width:502px;" />
</div>
`
