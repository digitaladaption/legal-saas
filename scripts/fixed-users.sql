-- Create test users for LawFirmAI (fixed version)
-- First, delete any existing test users to avoid conflicts
DELETE FROM auth.users WHERE email IN (
  'admin@lawfirmai.com',
  'attorney@lawfirmai.com', 
  'matty@digitaladaption.co.uk'
);

-- Now insert the test users
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
  '{"first_name": "Admin", "last_name": "User", "display_name": "Admin User"}',
  false,
  '',
  ''
),
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
  '{"first_name": "John", "last_name": "Attorney", "display_name": "John Attorney"}',
  false,
  '',
  ''
),
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
  '{"first_name": "Matty", "last_name": "Developer", "display_name": "Matty Developer"}',
  false,
  '',
  ''
);

-- Verify the users were created
SELECT 
  email, 
  email_confirmed_at IS NOT NULL as confirmed, 
  created_at 
FROM auth.users 
WHERE email IN (
  'admin@lawfirmai.com', 
  'attorney@lawfirmai.com', 
  'matty@digitaladaption.co.uk'
)
ORDER BY email; 