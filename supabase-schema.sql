-- ============================================================
-- PRIME CINE VISUALS — SUPABASE POSTGRESQL DATABASE SCHEMA
-- ============================================================

-- 1. Create Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  social_links JSONB DEFAULT '{"twitter":"", "instagram":"", "artstation":"", "website":""}'::jsonb,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_disabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('3D Animation', 'Visual Effects', 'CGI Commercial', 'Motion Design', 'Short Film', 'Product Visualization', 'Interactive Experience', 'Other')),
  media_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  admin_note TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Helper function to check if current executing user is an Admin (bypasses RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin' AND is_disabled = false
  );
$$;

-- Automatic Profile Creation Trigger on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = now();
  RETURN new;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated At timestamp refresher trigger
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_submissions_modtime
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- ------------------------
-- PROFILES POLICIES
-- ------------------------

-- Anyone (public/auth) can view active user profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND (role IS NOT DISTINCT FROM (SELECT role FROM public.profiles WHERE id = auth.uid()))); -- Prevents self role escalation!

-- Admins can update any profile (including changing roles or disabling users)
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Admins can delete profiles if required
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.is_admin(auth.uid()));

-- ------------------------
-- SUBMISSIONS POLICIES
-- ------------------------

-- Users can view their own submissions OR anyone can view APPROVED submissions
CREATE POLICY "View submissions policy"
  ON public.submissions FOR SELECT
  USING (
    status = 'APPROVED' 
    OR auth.uid() = user_id 
    OR public.is_admin(auth.uid())
  );

-- Authenticated users can create submissions belonging to themselves
CREATE POLICY "Users can create own submission"
  ON public.submissions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND status = 'PENDING'
  );

-- Users can update their own pending submissions (cannot change status or admin_note)
CREATE POLICY "Users can update own pending submissions"
  ON public.submissions FOR UPDATE
  USING (
    auth.uid() = user_id 
    AND status = 'PENDING'
  )
  WITH CHECK (
    auth.uid() = user_id 
    AND status = 'PENDING'
  );

-- Admins can update any submission (change status to APPROVED/REJECTED, add admin_note)
CREATE POLICY "Admins can update any submission"
  ON public.submissions FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Users can delete their own pending submissions
CREATE POLICY "Users can delete own pending submission"
  ON public.submissions FOR DELETE
  USING (auth.uid() = user_id AND status = 'PENDING');

-- Admins can delete any submission
CREATE POLICY "Admins can delete any submission"
  ON public.submissions FOR DELETE
  USING (public.is_admin(auth.uid()));

-- ============================================================
-- INITIAL ADMIN CREATION HELPER
-- Run this query after creating your account to promote it to Admin:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@primecine.com';
-- ============================================================
