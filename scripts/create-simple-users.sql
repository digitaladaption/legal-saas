-- Run this SQL script in your Supabase SQL Editor to create test users
-- Go to: https://supabase.com/dashboard/project/kromudvcpsscczwmwwoo/sql/new

-- First, let's disable email confirmation temporarily (optional)
-- UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;

-- Create test users directly in auth.users table
-- Note: This approach bypasses Supabase Auth API but works for testing

-- Insert test users into auth.users table
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  recovery_token
) VALUES 
-- Admin User
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@lawfirmai.com',
  crypt('admin123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Admin", "last_name": "User", "display_name": "Admin User", "role": "admin"}',
  false,
  '',
  ''
),
-- Attorney User
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'attorney@lawfirmai.com',
  crypt('attorney123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "John", "last_name": "Attorney", "display_name": "John Attorney", "role": "attorney"}',
  false,
  '',
  ''
),
-- Paralegal User
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'paralegal@lawfirmai.com',
  crypt('paralegal123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Sarah", "last_name": "Paralegal", "display_name": "Sarah Paralegal", "role": "paralegal"}',
  false,
  '',
  ''
),
-- Client User
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'client@lawfirmai.com',
  crypt('client123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Jane", "last_name": "Client", "display_name": "Jane Client", "role": "client"}',
  false,
  '',
  ''
),
-- Your email
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'matty@digitaladaption.co.uk',
  crypt('matty123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Matty", "last_name": "Developer", "display_name": "Matty Developer", "role": "admin"}',
  false,
  '',
  ''
)
ON CONFLICT (email) DO NOTHING;

-- Create user profiles if the table exists
INSERT INTO public.user_profiles (
  id,
  email,
  first_name,
  last_name,
  display_name,
  is_active,
  created_at,
  updated_at
)
SELECT 
  id,
  email,
  (raw_user_meta_data->>'first_name')::text,
  (raw_user_meta_data->>'last_name')::text,
  (raw_user_meta_data->>'display_name')::text,
  true,
  NOW(),
  NOW()
FROM auth.users 
WHERE email IN (
  'admin@lawfirmai.com',
  'attorney@lawfirmai.com', 
  'paralegal@lawfirmai.com',
  'client@lawfirmai.com',
  'matty@digitaladaption.co.uk'
)
ON CONFLICT (id) DO NOTHING;

-- Show created users
SELECT 
  email,
  email_confirmed_at IS NOT NULL as confirmed,
  raw_user_meta_data->>'display_name' as display_name,
  created_at
FROM auth.users 
WHERE email IN (
  'admin@lawfirmai.com',
  'attorney@lawfirmai.com', 
  'paralegal@lawfirmai.com',
  'client@lawfirmai.com',
  'matty@digitaladaption.co.uk'
)
ORDER BY email; 