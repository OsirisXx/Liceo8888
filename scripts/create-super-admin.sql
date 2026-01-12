-- Super Admin Account Setup Script
-- Run this in your Supabase SQL Editor
-- 
-- INSTRUCTIONS:
-- 1. First, create the user manually in Supabase Dashboard:
--    - Go to Authentication > Users > Add User
--    - Email: raijinjyn1@gmail.com
--    - Password: (your secure password)
--    - Check "Auto Confirm User" if you want to skip email verification
-- 
-- 2. Then run this script to assign the super_admin role

-- ============================================
-- Assign super_admin role to existing auth user
-- ============================================

DO $$
DECLARE
  target_user_id UUID;
  target_email TEXT := 'raijinjyn1@gmail.com';
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found in auth.users. Please create the user in Supabase Dashboard first.', target_email;
  END IF;
  
  -- Insert or update the user in public.users table with super_admin role
  INSERT INTO public.users (id, email, role, department, created_at)
  VALUES (target_user_id, target_email, 'super_admin', NULL, NOW())
  ON CONFLICT (id) DO UPDATE SET 
    role = 'super_admin',
    email = EXCLUDED.email;
  
  RAISE NOTICE 'Super admin role assigned to % (ID: %)', target_email, target_user_id;
END $$;

-- Create complaint_submissions table to track IP-based submissions
CREATE TABLE IF NOT EXISTS public.complaint_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster IP lookups
CREATE INDEX IF NOT EXISTS idx_complaint_submissions_ip_date 
ON public.complaint_submissions (ip_address, created_at);

-- Create system_audit_log table for super admin
CREATE TABLE IF NOT EXISTS public.system_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  actor_id UUID REFERENCES auth.users(id),
  actor_email VARCHAR(255),
  target_type VARCHAR(50),
  target_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for audit log queries
CREATE INDEX IF NOT EXISTS idx_system_audit_log_created 
ON public.system_audit_log (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_audit_log_action 
ON public.system_audit_log (action);

-- Enable RLS on new tables
ALTER TABLE public.complaint_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_audit_log ENABLE ROW LEVEL SECURITY;

-- Policies for complaint_submissions (allow insert from anyone, select for admins)
CREATE POLICY "Anyone can insert complaint submissions" 
ON public.complaint_submissions FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Super admins can view complaint submissions" 
ON public.complaint_submissions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Policies for system_audit_log (only super admins can view)
CREATE POLICY "Super admins can view audit log" 
ON public.system_audit_log FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

CREATE POLICY "System can insert audit log" 
ON public.system_audit_log FOR INSERT 
WITH CHECK (true);
