import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  try {

  if (req.method === 'POST') {
    const body = req.body
    const row = {
      service_id: body.serviceId || ('srv-' + Date.now()),
      title: body.businessName || body.title || 'Vendor Service',
      vendor_name: body.ownerName || body.businessName || '',
      category: body.category || 'General',
      location: body.location || '',
      description: body.description || '',
      images: body.images || [],
      status: 'pending'
    }
    const { data, error } = await supabase.from('services').insert([row])
    if (error) return res.status(500).json({ error })
    return res.json({ ok: true, data })
  }

  const { data, error } = await supabase.from('services').select('*').eq('status', 'approved').order('created_at', { ascending: true })
  if (error) return res.status(500).json({ error })
  res.json(data)
}

  } catch (err) {
    console.error('API error:', err)
    return res.status(500).json({ error: err.message || String(err) })
  }
