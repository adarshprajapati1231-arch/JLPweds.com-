import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  try {

  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }
  const { action, service_id } = req.body
  if (!['approve','reject'].includes(action)) return res.status(400).end()
  const status = action === 'approve' ? 'approved' : 'rejected'
  const { data, error } = await supabase.from('services').update({ status }).eq('service_id', service_id)
  if (error) return res.status(500).json({ error })
  res.json({ ok: true, data })
}

  } catch (err) {
    console.error('API error:', err)
    return res.status(500).json({ error: err.message || String(err) })
  }
