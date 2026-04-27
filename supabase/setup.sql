-- NassauLink Database Schema
-- Run this in Supabase Dashboard → SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  role text default 'owner' check (role in ('owner', 'admin')),
  created_at timestamp with time zone default now()
);

-- Categories table
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  slug text unique not null,
  icon text,
  listing_count integer default 0,
  created_at timestamp with time zone default now()
);

-- Listings table
create table if not exists listings (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null default '00000000-0000-0000-0000-000000000000',
  name text not null,
  slug text not null,
  category text not null,
  description text not null,
  phone text not null,
  whatsapp text,
  email text,
  website text,
  address text,
  tier text default 'free' check (tier in ('free', 'featured', 'premium', 'spotlight')),
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'suspended')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists listings_owner_id_idx on listings(owner_id);
create index if not exists listings_category_idx on listings(category);
create index if not exists listings_status_idx on listings(status);
create index if not exists listings_slug_idx on listings(slug);

-- Auto-update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_listings_updated_at on listings;
create trigger update_listings_updated_at
  before update on listings
  for each row execute function update_updated_at_column();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Row Level Security
alter table profiles enable row level security;
alter table listings enable row level security;
alter table categories enable row level security;

-- Profiles policies
drop policy if exists "Users can read own profile" on profiles;
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Listings policies
drop policy if exists "Anyone can read approved listings" on listings;
create policy "Anyone can read approved listings"
  on listings for select
  using (status = 'approved' or auth.uid() = owner_id);

drop policy if exists "Owners can insert listings" on listings;
create policy "Owners can insert listings"
  on listings for insert
  with check (auth.uid() = owner_id);

drop policy if exists "Owners can update own listings" on listings;
create policy "Owners can update own listings"
  on listings for update
  using (auth.uid() = owner_id);

drop policy if exists "Owners can delete own listings" on listings;
create policy "Owners can delete own listings"
  on listings for delete
  using (auth.uid() = owner_id);

-- Categories policies (public read)
drop policy if exists "Anyone can read categories" on categories;
create policy "Anyone can read categories"
  on categories for select
  using (true);

-- Seed categories
insert into categories (name, slug, icon) values
  ('Pool Services', 'pool-services', '🏊'),
  ('AC & Cooling', 'ac-cooling', '❄️'),
  ('Landscaping', 'landscaping', '🌴'),
  ('Auto Repair', 'auto-repair', '🚗'),
  ('Marine Services', 'marine-services', '🛥️'),
  ('Trades & Repairs', 'trades-repairs', '🔧'),
  ('Catering', 'catering', '🍽️'),
  ('Home Services', 'home-services', '🏠')
on conflict (name) do nothing;
