import { getASPs } from './actions'
import ASPTable from '@/components/ASPTable'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const asps = await getASPs()

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-900">Accredited Service Providers</h2>
        <p className="text-sm text-slate-500 mt-1">
          Click any ASP to view details and record research findings for the 3 questions.
        </p>
      </div>
      <ASPTable asps={asps} />
    </div>
  )
}
