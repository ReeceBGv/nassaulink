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
  image_url text,
  description text,
  listing_count integer default 0,
  created_at timestamp with time zone default now()
);

-- Listings table
create table if not exists listings (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  slug text not null,
  category text not null,
  description text not null,
  phone text not null,
  whatsapp text,
  email text,
  website text,
  address text,
  photos jsonb default '[]'::jsonb,
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
$$ language plpgsql
set search_path = public, pg_temp;

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
$$ language plpgsql security definer
set search_path = public, pg_temp;

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
insert into categories (name, slug, icon, description, image_url) values
  ('Pool Services', 'pool-services', '🏊', 'Pool cleaning, maintenance, and repair services', 'https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=800&q=80'),
  ('AC & Cooling', 'ac-cooling', '❄️', 'Air conditioning installation and repair', 'https://images.unsplash.com/photo-1631545308772-81a0e0a3a6eb?w=800&q=80'),
  ('Landscaping', 'landscaping', '🌴', 'Lawn care, gardening, and outdoor services', 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80'),
  ('Auto Repair', 'auto-repair', '🚗', 'Car repair, maintenance, and auto shops', 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80'),
  ('Marine Services', 'marine-services', '🛥️', 'Boat repair, yacht services, and marine supplies', 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&q=80'),
  ('Trades & Repairs', 'trades-repairs', '🔧', 'Plumbing, electrical, and handyman services', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80'),
  ('Catering', 'catering', '🍽️', 'Event catering and food services', 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80'),
  ('Home Services', 'home-services', '🏠', 'Cleaning, security, and home maintenance', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80'),
  ('Restaurants', 'restaurants', '🍴', 'Restaurants and dining establishments', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'),
  ('Bars & Nightlife', 'bars-nightlife', '🍹', 'Bars, clubs, and nightlife venues', 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80'),
  ('Spa & Wellness', 'spa-wellness', '💆', 'Spas, massage, and wellness centers', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80'),
  ('Pharmacy', 'pharmacy', '💊', 'Pharmacies and medical supplies', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80'),
  ('Grocery & Markets', 'grocery-markets', '🛒', 'Grocery stores and fresh markets', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80'),
  ('Boating', 'boating', '⚓', 'Boat rentals, charters, and services', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80'),
  ('Cafes', 'cafes', '☕', 'Coffee shops and cafes', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80'),
  ('Car Rental', 'car-rental', '🚙', 'Vehicle rental services', 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80'),
  ('Gym & Fitness', 'gym-fitness', '💪', 'Gyms and fitness centers', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80'),
  ('Tourism', 'tourism', '🏖️', 'Tours, attractions, and travel services', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80'),
  ('Dental', 'dental', '🦷', 'Dental clinics and services', 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80'),
  ('Liquor Store', 'liquor-store', '🍾', 'Wine, spirits, and beverages', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80'),
  ('Veterinary', 'veterinary', '🐕', 'Veterinary clinics and pet services', 'https://images.unsplash.com/photo-1628009368231-7bb6c1ed9d26?w=800&q=80'),
  ('Real Estate', 'real-estate', '🏘️', 'Property sales and rentals', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'),
  ('Hardware', 'hardware', '🔨', 'Hardware stores and building supplies', 'https://images.unsplash.com/photo-1581147036324-c17ac41dd161?w=800&q=80'),
  ('Laundry', 'laundry', '👕', 'Laundry and dry cleaning services', 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&q=80'),
  ('IT Services', 'it-services', '💻', 'Computer repair and tech support', 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=800&q=80'),
  ('Beauty Salon', 'beauty-salon', '💅', 'Hair, nail, and beauty services', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80'),
  ('Courier & Delivery', 'courier-delivery', '📦', 'Package and document delivery', 'https://images.unsplash.com/photo-1586864387789-628af9feed72?w=800&q=80'),
  ('Marina', 'marina', '⛵', 'Marina services and dockage', 'https://images.unsplash.com/photo-1500930287596-c1ecaa373bb2?w=800&q=80'),
  ('Printing', 'printing', '🖨️', 'Printing and copy services', 'https://images.unsplash.com/photo-1562569633-622303d7938f?w=800&q=80'),
  ('Bakery', 'bakery', '🥐', 'Bakeries and pastry shops', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80')
on conflict (name) do update set
  icon = excluded.icon,
  description = excluded.description,
  image_url = excluded.image_url;


-- Security: Revoke EXECUTE on SECURITY DEFINER functions from public roles
revoke execute on function handle_new_user() from anon, authenticated, public;
