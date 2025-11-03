-- Run this in Supabase SQL Editor
create extension if not exists pgcrypto;

create table vendors (
  id uuid primary key default gen_random_uuid(),
  name text,
  contact_phone text,
  contact_email text,
  location text,
  created_at timestamptz default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  service_id text unique not null,
  title text not null,
  price text,
  base_price numeric,
  price_per_km numeric,
  vendor_name text,
  vendor_id uuid references vendors(id) on delete set null,
  category text,
  location text,
  description text,
  images jsonb,
  status text default 'pending',
  created_at timestamptz default now()
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  service_id text,
  service_title text,
  vendor_name text,
  customer_name text,
  customer_phone text,
  event_location text,
  event_date date,
  event_time text,
  message text,
  calc_details jsonb,
  created_at timestamptz default now(),
  status text default 'pending'
);
