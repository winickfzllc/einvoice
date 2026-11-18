import 'server-only'

// Use require() so the CJS module loads reliably without ESM/default-export issues
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>

export async function extractPdfText(buffer: Buffer): Promise<string | null> {
  try {
    const data = await pdfParse(buffer)
    return data.text?.trim() || null
  } catch {
    return null
  }
}
