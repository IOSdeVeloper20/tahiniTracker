-- ============================================================
-- Tahini Tracker — Supabase Schema
-- Paste this into: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Customers table
create table if not exists customers (
  id          text primary key,
  name        text not null,
  phone       text,
  area        text,
  created_at  date default current_date
);

-- Orders table
create table if not exists orders (
  id               text primary key,
  customer_id      text references customers(id) on delete set null,
  date             date not null default current_date,
  products         text,
  total            numeric(10,2) default 0,
  delivery_fee     numeric(10,2) default 0,
  delivery_method  text default 'self',   -- 'self' | 'courier'
  courier_name     text default '',
  tracking_number  text default '',
  status           text default 'pending', -- pending | confirmed | packaged | inDelivery | delivered | cancelled
  payment_status   text default 'unpaid',  -- unpaid | paid
  payment_method   text default 'cash',    -- cash | instapay | transfer
  notes            text default ''
);

-- Expenses table
create table if not exists expenses (
  id        text primary key,
  date      date not null default current_date,
  category  text not null,  -- productCost | packaging | advertising | delivery | other
  amount    numeric(10,2) default 0,
  notes     text default ''
);

-- ── Row Level Security (keeps your data private) ──────────────────────────────
-- Since this is a solo app with no login, we use the anon key with open policies.
-- If you add auth later, change these to: using (auth.uid() = user_id)

alter table customers enable row level security;
alter table orders    enable row level security;
alter table expenses  enable row level security;

create policy "Allow all for anon" on customers for all to anon using (true) with check (true);
create policy "Allow all for anon" on orders    for all to anon using (true) with check (true);
create policy "Allow all for anon" on expenses  for all to anon using (true) with check (true);

-- ── Indexes for faster search ─────────────────────────────────────────────────
create index if not exists idx_orders_date        on orders(date desc);
create index if not exists idx_orders_customer_id on orders(customer_id);
create index if not exists idx_orders_status      on orders(status);
create index if not exists idx_expenses_date      on expenses(date desc);
create index if not exists idx_customers_phone    on customers(phone);
