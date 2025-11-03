import Head from 'next/head'
import { useState } from 'react'

export default function Register() {
  const [msg, setMsg] = useState('')
  async function submit(e) {
    e.preventDefault()
    const form = e.target
    const body = {
      businessName: form.businessName.value,
      ownerName: form.ownerName.value,
      category: form.category.value,
      location: form.location.value,
      whatsapp: form.whatsapp.value,
      email: form.email.value,
      description: form.description.value
    }
    const res = await fetch('/api/vendors', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)})
    const j = await res.json()
    if (j.ok) setMsg('Registration received. We will verify soon.')
    else setMsg('Error: ' + (j.error || 'unknown'))
  }
  return (
    <>
      <Head><title>Register as Vendor - JLPweds</title></Head>
      <div style={{padding:20}}>
        <h1>Register as Vendor</h1>
        <form onSubmit={submit}>
          <input name="businessName" placeholder="Business Name" required/>
          <input name="ownerName" placeholder="Owner Name" />
          <input name="category" placeholder="Category" />
          <input name="location" placeholder="Location" />
          <input name="whatsapp" placeholder="WhatsApp number" />
          <input name="email" placeholder="Email" />
          <textarea name="description" placeholder="Description" />
          <button className="btn" type="submit">Submit</button>
        </form>
        <div>{msg}</div>
      </div>
    </>
  )
}
