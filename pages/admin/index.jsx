import Head from 'next/head'
import { supabase } from '../../lib/supabaseClient'
export default function Admin({ pending }) {
  async function approve(id) {
    await fetch('/api/admin', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({action:'approve', service_id:id})})
    location.reload()
  }
  async function reject(id) {
    await fetch('/api/admin', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({action:'reject', service_id:id})})
    location.reload()
  }
  return (
    <>
      <Head><title>Admin - JLPweds</title></Head>
      <div style={{padding:20}}>
        <h1>Admin - Pending Vendors</h1>
        {pending.length===0 && <p>No pending vendors</p>}
        <ul>
          {pending.map(p=>(
            <li key={p.service_id}>
              <strong>{p.title}</strong> ({p.vendor_name}) — {p.location}
              <button onClick={()=>approve(p.service_id)}>Approve</button>
              <button onClick={()=>reject(p.service_id)}>Reject</button>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export async function getServerSideProps() {
  const { data: pending } = await supabase.from('services').select('*').eq('status','pending').order('created_at',{ascending:true})
  return { props: { pending: pending || [] } }
}
