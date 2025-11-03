import { supabase } from '../../utils/supabaseClient';

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase.from('admins').select('*');

    if (error) {
      throw error;
    }

    return res.json({ ok: true, data });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
