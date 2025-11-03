import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const body = req.body || {}

    const message = `JLPweds Booking Request\nService: ${body.serviceTitle || ''}\nService ID: ${body.serviceId || ''}\nVendor: ${body.vendorName || ''}\nCustomer: ${body.name || ''}\nMobile: ${body.mobile || ''}\nDate: ${body.eventDate || ''}`

    const { data, error } = await supabase.from('bookings').insert([{
      service_id: body.serviceId || null,
      service_title: body.serviceTitle || '',
      vendor_name: body.vendorName || '',
      customer_name: body.name || '',
      customer_phone: body.mobile || '',
      event_location: body.eventLocation || '',
      event_date: body.eventDate || null,
      event_time: body.eventTime || null,
      message,
      calc_details: body.calcDetails || null
    }])

    if (error) {
      console.error('Supabase insert error:', error)
      return res.status(500).json({ error: error.message || error })
    }

    const wa = process.env.WHATSAPP_NUMBER || '917836998590'
    const waLink = `https://wa.me/${wa}?text=${encodeURIComponent(message)}`
    res.json({ ok: true, waLink })
  } catch (err) {
    console.error('Error in bookings API:', err)
    res.status(500).json({ error: err.message || String(err) })
  }
}
