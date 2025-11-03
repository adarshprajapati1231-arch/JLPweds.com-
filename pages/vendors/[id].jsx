import Head from 'next/head'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function VendorPage({ vendor }) {
  const router = useRouter()
  if (!vendor) return <div style={{padding:20}}>Vendor not found</div>

  return (
    <>
      <Head>
        <title>{vendor.title} | JLPweds</title>
        <meta name="description" content={vendor.description || 'Vendor details'} />
      </Head>
      <div className="container" style={{padding:20}}>
        <h1>{vendor.title}</h1>
        <p><strong>Category:</strong> {vendor.category}</p>
        <p><strong>Location:</strong> {vendor.location}</p>
        <p>{vendor.description}</p>
        <p><strong>Vendor:</strong> {vendor.vendor_name}</p>

        <form id="bookingForm" method="post" action="/api/bookings" onSubmit={(e)=>{e.preventDefault(); bookNow(e, vendor)}}>
          <input name="name" placeholder="Your name" required/>
          <input name="mobile" placeholder="Mobile" required/>
          <input name="eventDate" placeholder="Event date (YYYY-MM-DD)" />
          <button type="submit" className="btn">Book via JLPweds</button>
        </form>
      </div>
    </>
  )
}

async function bookNow(e, vendor) {
  const form = e.target
  const data = {
    serviceId: vendor.service_id,
    serviceTitle: vendor.title,
    vendorName: vendor.vendor_name,
    name: form.name.value,
    mobile: form.mobile.value,
    eventDate: form.eventDate.value,
    eventLocation: vendor.location
  }
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(data)
  })
  const json = await res.json()
  if (json.waLink) {
    window.location.href = json.waLink
  } else {
    alert('Error creating booking')
  }
}

export async function getServerSideProps(ctx) {
  const id = ctx.params.id
  const { data } = await supabase.from('services').select('*').eq('service_id', id).single()
  return { props: { vendor: data || null } }
}
