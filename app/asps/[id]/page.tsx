import { notFound } from 'next/navigation'
import { getASP } from '@/app/actions'
import ASPDetailForm from '@/components/ASPDetailForm'

export const dynamic = 'force-dynamic'

export default async function ASPDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let asp
  try {
    asp = await getASP(id)
  } catch {
    notFound()
  }

  if (!asp) notFound()

  return <ASPDetailForm asp={asp} />
}
