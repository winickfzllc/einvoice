---
name: project-crm-einvoice
description: UAE eInvoice ASP CRM — Next.js + Supabase app tracking 88 accredited service providers with research question fields
metadata:
  type: project
---

Full-stack CRM built to track 88 UAE Ministry of Finance accredited eInvoicing service providers.

**Why:** User needs to compare ASPs across 3 key questions to decide which to use.

**How to apply:** When adding features or making changes, understand that this is a personal research/decision-making tool, not a multi-user SaaS.

## Tech Stack
- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL) — project ID `mpspvwacishcnrcfevun`
- **Repo:** https://github.com/winickfzllc/einvoice
- **Deploy:** Not yet deployed — needs Vercel setup with env vars `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

## Database
Single table `asps` with:
- MoF data: `name`, `accreditation_number`, `website`, `contact_person`, `email`, `phone`, `sort_order`
- Status: `status` (pending/contacted/responded/completed), `last_contacted`
- Q1 fields: `q1_year1_cost`, `q1_renewal_cost`, `q1_notes`
- Q2 fields: `q2_year1_cost`, `q2_renewal_cost`, `q2_notes`
- Q3 fields: `q3_freemium` (boolean), `q3_freemium_notes`
- `general_notes`, `created_at`, `updated_at`

## The 3 Research Questions
1. **Q1:** Manual/CSV upload pricing for <100 invoices/year — Year 1 total cost + renewal
2. **Q2:** QuickBooks integration pricing — Year 1 total cost + renewal
3. **Q3:** Freemium/free web portal option for 10-20 invoices/year at zero cost
