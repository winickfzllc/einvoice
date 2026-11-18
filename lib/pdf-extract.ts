import 'server-only'

export async function extractPdfText(buffer: Buffer): Promise<{ text: string | null; error: string | null }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>
    const data = await pdfParse(buffer)
    return { text: data.text?.trim() || null, error: null }
  } catch (e) {
    return { text: null, error: e instanceof Error ? e.message : String(e) }
  }
}
