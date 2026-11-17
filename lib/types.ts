export type ASPStatus = 'pending' | 'contacted' | 'responded' | 'completed'

export interface ASP {
  id: string
  sort_order: number | null
  name: string
  accreditation_number: string | null
  website: string | null
  contact_person: string | null
  email: string | null
  phone: string | null
  status: ASPStatus
  // Option 1: Freemium
  q1_freemium: boolean | null
  q1_invoice_limit: string | null
  q1_notes: string | null
  // Option 2: Manual / CSV upload
  q2_invoice_limit: string | null
  q2_year1_cost: string | null
  q2_renewal_cost: string | null
  q2_notes: string | null
  // Option 3: Integration (QuickBooks etc.)
  q3_invoice_limit: string | null
  q3_year1_cost: string | null
  q3_renewal_cost: string | null
  q3_notes: string | null
  general_notes: string | null
  last_contacted: string | null
  created_at: string
  updated_at: string
}

export type ASPUpdate = Partial<Omit<ASP, 'id' | 'created_at' | 'updated_at'>>
