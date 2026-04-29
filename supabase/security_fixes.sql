-- ============================================================
-- NASSAULINK SECURITY FIXES
-- Run this in Supabase Dashboard → SQL Editor (as admin/service_role)
-- ============================================================

-- ------------------------------------------------------------
-- FIX 1: Set explicit search_path on all functions (prevents search_path injection)
-- ------------------------------------------------------------

-- Fix update_updated_at_column (no security definer, just needs search_path)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

-- Fix handle_new_user (SECURITY DEFINER + search_path)
-- This function is called by auth trigger, not meant for public REST API use
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix approve_business_claim (SECURITY DEFINER + search_path)
CREATE OR REPLACE FUNCTION approve_business_claim(claim_id UUID, admin_user_id UUID)
RETURNS UUID AS $$
DECLARE
  new_listing_id UUID;
  claim_record business_claims%ROWTYPE;
BEGIN
  SELECT * INTO claim_record FROM business_claims WHERE id = claim_id;
  
  IF claim_record IS NULL THEN
    RAISE EXCEPTION 'Claim not found';
  END IF;
  
  IF claim_record.status != 'pending' THEN
    RAISE EXCEPTION 'Claim is not pending';
  END IF;
  
  INSERT INTO listings (
    owner_id, name, slug, category, description, phone, whatsapp, 
    email, website, address, tier, status
  ) VALUES (
    admin_user_id,
    claim_record.business_name,
    claim_record.slug,
    claim_record.category,
    COALESCE(claim_record.description, claim_record.business_name),
    claim_record.phone,
    claim_record.whatsapp,
    claim_record.email,
    claim_record.website,
    claim_record.address,
    claim_record.tier,
    'approved'
  )
  RETURNING id INTO new_listing_id;
  
  UPDATE business_claims 
  SET status = 'approved', 
      approved_at = now(), 
      approved_by = admin_user_id,
      notes = COALESCE(notes, '') || ' | Approved and created listing ' || new_listing_id::TEXT
  WHERE id = claim_id;
  
  RETURN new_listing_id;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- ------------------------------------------------------------
-- FIX 2: Revoke EXECUTE on SECURITY DEFINER functions from public roles
-- ------------------------------------------------------------

-- handle_new_user should ONLY be called by the auth trigger, never via REST API
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon, authenticated, PUBLIC;

-- approve_business_claim should ONLY be called by admins
REVOKE EXECUTE ON FUNCTION approve_business_claim(UUID, UUID) FROM anon, authenticated, PUBLIC;

-- update_updated_at_column is a trigger function, doesn't need explicit revoke
-- (triggers bypass RLS anyway)

-- ------------------------------------------------------------
-- FIX 3: Enable Leaked Password Protection in Auth
-- ------------------------------------------------------------
-- NOTE: This must be done in the Supabase Dashboard UI:
-- Authentication → Password Security → Leaked Password Protection → Enable
-- 
-- SQL equivalent (if supported by your Supabase version):
-- UPDATE auth.config SET enable_leaked_password_protection = true;
-- Or via Supabase Management API:
-- PATCH /v1/projects/{ref}/auth/config
-- Body: {"password_hpkc_config": {"enabled": true}}

-- ------------------------------------------------------------
-- VERIFICATION: Check that fixes are applied
-- ------------------------------------------------------------

-- Verify search_path is set
SELECT 
    p.proname AS function_name,
    p.prosecdef AS security_definer,
    p.proconfig AS search_path_config
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('update_updated_at_column', 'handle_new_user', 'approve_business_claim')
ORDER BY p.proname;

-- Verify permissions (should show no grants to anon/authenticated)
SELECT 
    grantee,
    routine_name,
    privilege_type
FROM information_schema.role_routine_grants
WHERE routine_schema = 'public'
AND routine_name IN ('handle_new_user', 'approve_business_claim')
AND grantee IN ('anon', 'authenticated', 'public')
ORDER BY routine_name, grantee;
