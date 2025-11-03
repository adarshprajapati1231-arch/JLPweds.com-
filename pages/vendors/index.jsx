import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'

export default function Vendors({ vendors }) {
  return (
    <>
      <Head>
        <title>Vendors - JLPweds</title>
        <meta name="description" content="Browse verified wedding vendors" />
      </Head>
      <div className="container" style={{padding: '20px'}}>
        <h1>Vendors</h1>
        <div className="grid">
          {vendors.map(v => (
            <div key={v.service_id} className="card vendor-card">
              <h2>{v.title}</h2>
              <p>{v.vendor_name} — {v.location}</p>
              <p>Price: {v.price || 'Contact'}</p>
              <Link href={`/vendors/${v.service_id}`}><a className="btn">View Details</a></Link>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export async function getServerSideProps() {
  const { data: vendors } = await supabase
    .from('services')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: true })

  return { props: { vendors: vendors || [] } }
}
