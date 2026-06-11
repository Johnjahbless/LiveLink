-- LiveLink schema
-- Run in Supabase SQL editor

-- ─── EXTENSIONS ─────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── VENDORS ─────────────────────────────────────────────────────────────────
create table if not exists public.vendors (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  business_name text,
  phone       text,
  email       text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── VENDOR WALLETS ──────────────────────────────────────────────────────────
create table if not exists public.vendor_wallets (
  id              uuid primary key default uuid_generate_v4(),
  vendor_id       uuid not null unique references public.vendors(id) on delete cascade,
  credits         integer not null default 5 check (credits >= 0),
  total_purchased integer not null default 0,
  total_used      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─── CREDIT PACKAGES ─────────────────────────────────────────────────────────
create table if not exists public.credit_packages (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  credits     integer not null,
  price_ngn   integer not null, -- kobo (₦2000 = 200000 kobo)
  is_active   boolean not null default true,
  sort_order  integer not null default 0
);

insert into public.credit_packages (name, credits, price_ngn, sort_order) values
  ('Starter',  25,  200000, 1),
  ('Basic',    75,  500000, 2),
  ('Standard', 175, 1000000, 3),
  ('Pro',      500, 2500000, 4)
on conflict do nothing;

-- ─── CREDIT TRANSACTIONS ─────────────────────────────────────────────────────
create table if not exists public.credit_transactions (
  id                  uuid primary key default uuid_generate_v4(),
  vendor_id           uuid not null references public.vendors(id) on delete cascade,
  package_id          uuid references public.credit_packages(id),
  credits             integer not null,
  amount_ngn          integer not null,
  paystack_reference  text unique,
  status              text not null default 'pending' check (status in ('pending','completed','failed')),
  created_at          timestamptz not null default now()
);

-- ─── DELIVERIES ──────────────────────────────────────────────────────────────
create table if not exists public.deliveries (
  id                  uuid primary key default uuid_generate_v4(),
  vendor_id           uuid not null references public.vendors(id) on delete cascade,
  -- customer info
  customer_name       text not null,
  customer_phone      text,
  delivery_notes      text,
  -- access tokens (32-char hex, URL-safe)
  rider_token         text not null unique,
  customer_token      text not null unique,
  -- lifecycle
  status              text not null default 'pending'
                        check (status in ('pending','active','delivered','cancelled')),
  -- payment
  payment_type        text check (payment_type in ('cash','transfer')),
  payment_amount      numeric(12,2),
  payment_confirmed   boolean not null default false,
  payment_confirmed_at timestamptz,
  -- timestamps
  started_at          timestamptz,
  delivered_at        timestamptz,
  credit_deducted     boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists deliveries_vendor_id_idx on public.deliveries(vendor_id);
create index if not exists deliveries_rider_token_idx on public.deliveries(rider_token);
create index if not exists deliveries_customer_token_idx on public.deliveries(customer_token);
create index if not exists deliveries_status_idx on public.deliveries(status);

-- ─── DELIVERY LOCATIONS ──────────────────────────────────────────────────────
create table if not exists public.delivery_locations (
  id           bigserial primary key,
  delivery_id  uuid not null references public.deliveries(id) on delete cascade,
  lat          double precision not null,
  lng          double precision not null,
  accuracy     real,
  speed        real,
  heading      real,
  recorded_at  timestamptz not null default now()
);

create index if not exists delivery_locations_delivery_id_idx
  on public.delivery_locations(delivery_id, recorded_at desc);

-- ─── PAYMENT RECEIPTS ────────────────────────────────────────────────────────
create table if not exists public.payment_receipts (
  id           uuid primary key default uuid_generate_v4(),
  delivery_id  uuid not null references public.deliveries(id) on delete cascade,
  file_url     text not null,
  file_path    text not null,
  uploaded_by  text not null default 'customer',
  created_at   timestamptz not null default now()
);

-- ─── REALTIME ────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.delivery_locations;
alter publication supabase_realtime add table public.deliveries;

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table public.vendors              enable row level security;
alter table public.vendor_wallets       enable row level security;
alter table public.credit_transactions  enable row level security;
alter table public.deliveries           enable row level security;
alter table public.delivery_locations   enable row level security;
alter table public.payment_receipts     enable row level security;
alter table public.credit_packages      enable row level security;

-- vendors: own row only
create policy "vendor_own" on public.vendors
  for all using (auth.uid() = id);

-- wallets: own wallet only
create policy "wallet_own" on public.vendor_wallets
  for all using (auth.uid() = vendor_id);

-- credit transactions: own only
create policy "txn_own" on public.credit_transactions
  for all using (auth.uid() = vendor_id);

-- credit packages: public read
create policy "packages_public_read" on public.credit_packages
  for select using (true);

-- deliveries: vendor manages their own; public read by id (UUID unguessable)
create policy "delivery_vendor" on public.deliveries
  for all using (auth.uid() = vendor_id);
create policy "delivery_public_read" on public.deliveries
  for select using (true);

-- delivery_locations: public read/insert (token validation done server-side)
create policy "locations_public_read" on public.delivery_locations
  for select using (true);
create policy "locations_public_insert" on public.delivery_locations
  for insert with check (true);

-- payment_receipts: public insert for customer uploads; vendor reads own
create policy "receipts_public_insert" on public.payment_receipts
  for insert with check (true);
create policy "receipts_vendor_read" on public.payment_receipts
  for select using (
    auth.uid() = (select vendor_id from public.deliveries where id = delivery_id)
  );

-- ─── TRIGGERS ────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.vendors (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  insert into public.vendor_wallets (vendor_id, credits)
  values (new.id, 5);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger update_vendors_updated_at
  before update on public.vendors
  for each row execute procedure public.update_updated_at();

create trigger update_wallets_updated_at
  before update on public.vendor_wallets
  for each row execute procedure public.update_updated_at();

create trigger update_deliveries_updated_at
  before update on public.deliveries
  for each row execute procedure public.update_updated_at();

-- ─── STORED FUNCTIONS ────────────────────────────────────────────────────────

-- Atomic: deduct 1 credit AND create delivery in one transaction
create or replace function public.create_delivery_and_deduct(
  p_vendor_id       uuid,
  p_customer_name   text,
  p_customer_phone  text,
  p_delivery_notes  text,
  p_rider_token     text,
  p_customer_token  text,
  p_payment_type    text default null,
  p_payment_amount  numeric default null
)
returns public.deliveries language plpgsql security definer as $$
declare
  v_delivery public.deliveries;
  v_credits  integer;
begin
  select credits into v_credits
  from public.vendor_wallets
  where vendor_id = p_vendor_id
  for update;

  if v_credits is null or v_credits < 1 then
    raise exception 'Insufficient credits';
  end if;

  update public.vendor_wallets
  set credits   = credits - 1,
      total_used = total_used + 1
  where vendor_id = p_vendor_id;

  insert into public.deliveries (
    vendor_id, customer_name, customer_phone, delivery_notes,
    rider_token, customer_token, payment_type, payment_amount, credit_deducted
  ) values (
    p_vendor_id, p_customer_name, p_customer_phone, p_delivery_notes,
    p_rider_token, p_customer_token, p_payment_type, p_payment_amount, true
  )
  returning * into v_delivery;

  return v_delivery;
end;
$$;

-- Add credits after successful Paystack payment
create or replace function public.add_credits(
  p_vendor_id          uuid,
  p_credits            integer,
  p_amount_ngn         integer,
  p_paystack_reference text,
  p_package_id         uuid default null
)
returns void language plpgsql security definer as $$
begin
  update public.vendor_wallets
  set credits         = credits + p_credits,
      total_purchased = total_purchased + p_credits
  where vendor_id = p_vendor_id;

  update public.credit_transactions
  set status = 'completed'
  where paystack_reference = p_paystack_reference;
end;
$$;
