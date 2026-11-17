'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import type { ASPUpdate } from '@/lib/types'

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
