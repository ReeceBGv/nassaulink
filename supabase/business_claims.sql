-- Business Claims table (for unauthenticated "Claim Your Business" submissions)
create table if not exists business_claims (
  id uuid primary key default uuid_generate_v4(),
  business_name text not null,
  slug text unique not null,
  category text not null,
  description text,
  phone text not null,
  whatsapp text,
  email text,
  website text,
  address text,
  contact_name text,
  contact_email text not null,
  contact_phone text,
  tier text default 'free' check (tier in ('free', 'featured', 'premium', 'spotlight')),
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  source text default 'manual', -- 'manual', 'scraper', 'import'
  notes text, -- admin notes
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  approved_at timestamp with time zone,
  approved_by uuid references auth.users(id)
);

create index if not exists business_claims_status_idx on business_claims(status);
create index if not exists business_claims_category_idx on business_claims(category);
create index if not exists business_claims_source_idx on business_claims(source);

-- Trigger to auto-update updated_at
drop trigger if exists update_business_claims_updated_at on business_claims;
create trigger update_business_claims_updated_at
  before update on business_claims
  for each row execute function update_updated_at_column();

-- RLS: Public can insert (for the claim form)
alter table business_claims enable row level security;

drop policy if exists "Public can submit claims" on business_claims;
create policy "Public can submit claims"
  on business_claims for insert
  with check (true);

-- Only admins can read/update (we'll handle admin check in the app)
drop policy if exists "Public cannot read claims" on business_claims;
create policy "Public cannot read claims"
  on business_claims for select
  using (false);

-- Function to approve a claim and create listing
create or replace function approve_business_claim(claim_id uuid, admin_user_id uuid)
returns uuid as $$
declare
  new_listing_id uuid;
  claim_record business_claims%rowtype;
begin
  -- Get the claim
  select * into claim_record from business_claims where id = claim_id;
  
  if claim_record is null then
    raise exception 'Claim not found';
  end if;
  
  if claim_record.status != 'pending' then
    raise exception 'Claim is not pending';
  end if;
  
  -- Create a placeholder user for the business owner if they don't have auth yet
  -- For now, we'll set owner_id to the admin who approves (they can reassign later)
  -- In production, you'd send an invite email to contact_email
  
  insert into listings (
    owner_id, name, slug, category, description, phone, whatsapp, 
    email, website, address, tier, status
  ) values (
    admin_user_id,
    claim_record.business_name,
    claim_record.slug,
    claim_record.category,
    coalesce(claim_record.description, claim_record.business_name),
    claim_record.phone,
    claim_record.whatsapp,
    claim_record.email,
    claim_record.website,
    claim_record.address,
    claim_record.tier,
    'approved'
  )
  returning id into new_listing_id;
  
  -- Update claim as approved
  update business_claims 
  set status = 'approved', 
      approved_at = now(), 
      approved_by = admin_user_id,
      notes = coalesce(notes, '') || ' | Approved and created listing ' || new_listing_id::text
  where id = claim_id;
  
  -- Send email notification to claimant (using AgentMail)
  perform net.http_post(
    url := 'https://api.agentmail.to/inboxes',
    headers := jsonb_build_object(
      'Authorization', 'Bearer am_us_be336c85252831878443f80382d0b793976266c12ffac543b79dc01487af8467',
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'to', claim_record.contact_email,
      'subject', 'Your NassauLink listing has been approved!',
      'body', 'Hi ' || coalesce(claim_record.contact_name, 'there') || E'\n\nYour business listing for "' || claim_record.business_name || E'" has been approved and is now live on NassauLink.\n\nView it here: https://nassaulink.com/business/' || claim_record.slug || E'\n\nYou can manage your listing by signing in at https://nassaulink.com/login\n\nWelcome aboard!\n- The NassauLink Team'
    )
  );
  
  return new_listing_id;
end;
$$ language plpgsql security definer
set search_path = public, pg_temp;

-- Security: Revoke EXECUTE on SECURITY DEFINER function from public roles
revoke execute on function approve_business_claim(uuid, uuid) from anon, authenticated, public;
