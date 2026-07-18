-- Create First Admin User
-- This promotes the first student account to admin
-- OR you can replace the email with a specific one

-- Option 1: Make the first registered user an admin
UPDATE public.users 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM public.users 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- Option 2: Make a specific email an admin (RECOMMENDED)
-- Uncomment and replace with your email:
-- UPDATE public.users 
-- SET role = 'admin' 
-- WHERE email = 'your-email@example.com';

-- Verify the admin was created
SELECT 
  id,
  email,
  name,
  role,
  created_at
FROM public.users 
WHERE role = 'admin';
