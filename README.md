# JLPweds - Next.js + Supabase Starter

This package contains a Next.js SSR project scaffold preconfigured to use Supabase for data and Vercel for hosting.
It preserves your existing HTML/CSS/JS theme and client-side behaviors.

## What's included
- Next.js pages with SSR
- API routes: /api/vendors, /api/bookings, /api/admin
- Supabase client + admin import script
- Public assets (style.css, script.js, vendors.json from your MVP)

## Setup (local)
1. Install dependencies:
   ```
   npm install
   ```
2. Create `.env.local` and set:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key> 
   WHATSAPP_NUMBER=917836998590
   ADMIN_EMAIL=jlpweds001@gmail.com
   ```
3. Run locally:
   ```
   npm run dev
   ```
4. Import vendors:
   - Ensure `public/vendors.json` exists (included)
   - Set env vars for service key and run:
     ```
     node scripts/import_vendors.js
     ```

## Deploy to Vercel
1. Push to GitHub.
2. Create an account at https://vercel.com and "Import Project" from GitHub.
3. In Vercel project settings add Environment Variables (same as .env.local).
4. Deploy. Vercel will server-side render pages automatically.

## Supabase setup quick guide
1. Create account at https://supabase.com and new project.
2. Open "SQL Editor" and run `supabase_schema.sql` to create tables.
3. Find Project Settings -> API to get your `URL` and `anon` key.
4. Generate a Service Role key (Settings -> API).
5. Use those keys in `.env.local` and Vercel env variables.

## Notes
- Admin verification uses the `status` column on `services`. Use Supabase dashboard or /admin page to approve.
- Bookings are stored in `bookings` table before redirecting to WhatsApp.

