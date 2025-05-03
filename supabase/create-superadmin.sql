-- Script to create a superadmin account
-- Run this in the Supabase SQL Editor after running the setup.sql script

-- IMPORTANT: Replace the placeholder values with your actual superadmin email/password
DO $$
DECLARE
  _user_id uuid;
BEGIN
  -- Create the user account through Supabase Auth
  -- Note: The password must be at least 6 characters
  INSERT INTO auth.users (
    email,
    email_confirmed_at,
    encrypted_password,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at
  ) VALUES (
    'superadm.artcoffee@gmail.com', -- Replace with your desired email
    now(),
    -- Generate an encrypted password (this is 'superadmin123')
    crypt('superadmin123', gen_salt('bf')), -- Replace with your desired password
    '{"provider":"email","providers":["email"]}',
    '{"role":"superadmin"}',
    now()
  )
  RETURNING id INTO _user_id;

  -- Create the profile record with superadmin role
  INSERT INTO profiles (id, email, role, approved)
  VALUES (_user_id, 'superadm.artcoffee@gmail.com', 'superadmin', true); -- Replace with the same email

  RAISE NOTICE 'Superadmin created with ID: %', _user_id;
END;
$$;

-- Confirm the superadmin account was created
SELECT 
  au.id, 
  au.email, 
  p.role, 
  p.approved
FROM auth.users au
JOIN profiles p ON au.id = p.id
WHERE p.role = 'superadmin'; 