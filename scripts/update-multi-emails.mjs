// One-off script: update email + contact_person for ASPs with multiple contacts
// Run with: node scripts/update-multi-emails.mjs

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars')
  process.exit(1)
}

const updates = [
  { acc: '196766', email: 'sajid@advintek.ae, sanam@advintek.ae', contact_person: 'Sajid Hameed, Sanam Wadhwa' },
  { acc: '189050', email: 'info@ardentaxit.tax, deepak@ardentaxit.tax, bharat@ardentaxit.tax', contact_person: 'Vivek Dand, Deepak Banger, Bharat Bajaj' },
  { acc: '147900', email: 'bishoy.sami@azdan.com, abdulla.rashad@azdan.com, sales@azdan.com', contact_person: 'Bishoy Sami, Abdullah Rashad, sales@azdan.com' },
  { acc: '141846', email: 'uae-inv@azentio.com, Rakesh.m@azentio.com', contact_person: 'Hiltrud Jenifer, Rakesh M' },
  { acc: '178533', email: 'hello@casim.ae, stuart.mckechnie@casim.ae', contact_person: 'Stuart McKechnie' },
  { acc: '101139', email: 'niraj@cygnet.one, Sameer.khan@cygnet.one', contact_person: 'Niraj Hutheesing, Sameer Khan' },
  { acc: '158998', email: 'nithin@fyient.com, myneni@fyient.com', contact_person: 'Nithin Kumar Gurijala, Myneni Krishna Sri' },
  { acc: '167585', email: 'kaleem@gssmcgulf.com, msochaan@gssmcgulf.com, gulzar@gssmcgulf.com', contact_person: 'Muhammad Kaleem, Rai Muhammad Sochaan, Gulzar Ahmad' },
  { acc: '154195', email: 'piyush@infocustechnologiesllcfz.com, dhiraj@infocustechnologiesllcfz.com, dipak@infocustechnologiesllcfz.com', contact_person: 'Piyush Papneja, Dhiraj Sankhi, Dipak Rakhecha' },
  { acc: '153288', email: 'Ramesh.aidasani@kasaadvisory.com, Muhammad.ali@kasaadvisory.com', contact_person: 'Ramesh Kumar Aidasani, Muhammad Ali Warraich' },
  { acc: '104802', email: 'uae-sales@namiri.tech, ahmed.farouk@namiri.tech', contact_person: 'Adel Bin Hatem Al Blooshi, Ahmed Farouk' },
  { acc: '197640', email: 'ceo@resilienceuae.com, partnerart@resilienceuae.com', contact_person: 'Khalid Farooq, Farhan Ali' },
  { acc: '139410', email: 'ridvan.yigit@rtcsuite.com, fabio.santoro@rtcsuite.com', contact_person: 'Rıdvan Yigit, Fabio Santoro' },
  { acc: '192393', email: 'manishbucha@snbconsulting.ae, prakriti@snbconsulting.ae, soumendra@snbconsulting.ae', contact_person: 'Manish Bucha, Prakriti Dangi, Soumendra Dalai' },
  { acc: '148957', email: 'bindu.james@uhy-ae.com, einvoicing@uhy-ae.com', contact_person: 'Bindu James' },
  { acc: '133108', email: 'rkapoor@webtel.co.in, Maneesh.aggarwal@webtel.co.in', contact_person: 'Rajender Kapoor, Maneesh Aggarwal' },
  { acc: '193284', email: 'rishisapra@youngglobal.co, sheetalsapra@youngglobal.co, yedu@youngglobal.co', contact_person: 'Rishi Sapra, Sheetal Sapra, Yedukondalu Mallela' },
]

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal',
}

let ok = 0, fail = 0
for (const u of updates) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/asps?accreditation_number=eq.${u.acc}`,
    { method: 'PATCH', headers, body: JSON.stringify({ email: u.email, contact_person: u.contact_person }) }
  )
  if (res.ok) {
    console.log(`✓ ${u.acc}`)
    ok++
  } else {
    console.error(`✗ ${u.acc}: ${res.status} ${await res.text()}`)
    fail++
  }
}

console.log(`\nDone: ${ok} updated, ${fail} failed`)
