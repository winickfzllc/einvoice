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
  q1_year1_cost: string | null
  q1_renewal_cost: string | null
  q1_notes: string | null
  q2_year1_cost: string | null
  q2_renewal_cost: string | null
  q2_notes: string | null
  q3_freemium: boolean | null
  q3_freemium_notes: string | null
  general_notes: string | null
  last_contacted: string | null
  created_at: string
  updated_at: string
}

export type ASPUpdate = Partial<Omit<ASP, 'id' | 'created_at' | 'updated_at'>>
