-- Verify users were created successfully
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