/**
 * Usage:
 * 1. Place vendors.json in project root (public/vendors.json included)
 * 2. Set env vars:
 *    NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * 3. Run: node scripts/import_vendors.js
 */
import fs from 'fs'
import path from 'path'
import { supabaseAdmin } from './supabaseAdminClient.js'

const file = path.join(process.cwd(), 'public', 'vendors.json')
async function run() {
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
  const rows = []
  raw.forEach(cat => {
    const category = cat.category || 'General'
    ;(cat.subcategories || []).forEach(s => {
      rows.push({
        service_id: s.serviceId,
        title: s.title,
        price: s.price || null,
        base_price: s.basePrice || null,
        price_per_km: s.pricePerKm || null,
        vendor_name: s.vendorName || '',
        category: category,
        location: s.location || '',
        description: s.description || '',
        images: s.images || [],
        status: 'approved'
      })
    })
  })
  console.log('Inserting', rows.length, 'services...')
  const { data, error } = await supabaseAdmin.from('services').insert(rows)
  if (error) {
    console.error('Import error:', error)
    process.exit(1)
  }
  console.log('Imported', data.length)
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })
