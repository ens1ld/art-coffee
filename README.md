# Art Coffee - Role-based Access Control

This Next.js application implements a comprehensive role-based access control system using Supabase for authentication and authorization.

## Features

- User authentication via Supabase Auth
- Role-based access control with three roles: user, admin, and superadmin
- Protected routes based on user roles
- Conditional UI rendering based on user permissions
- Admin approval workflow for new admin accounts

## Access Control Rules

- **Public Routes**: Home, Login, Signup (accessible without login)
- **User Routes**: Order, Gift Cards, Loyalty, Bulk Order, Profile (requires login)
- **Admin Routes**: Admin Dashboard and subpages (requires admin role)
- **Superadmin Routes**: Superadmin Dashboard (requires superadmin role)

## Test Users

For testing purposes, the following accounts are available:

| Email                    | Password    | Role       | Status    |
|--------------------------|-------------|------------|-----------|
| user@example.com         | password123 | user       | Approved  |
| admin@example.com        | password123 | admin      | Approved  |
| pending-admin@example.com| password123 | admin      | Pending   |
| superadmin@example.com   | password123 | superadmin | Approved  |

## Testing Instructions

1. Start the development server:
   ```
npm run dev
   ```

2. Access the application at http://localhost:3000

3. Test the authentication flow:
   - Sign up as a new user
   - Log in with an existing account
   - Test role-specific redirects after login

4. Test role-based access control:
   - Try accessing `/admin` as a regular user (should redirect to not-authorized)
   - Try accessing `/superadmin` as an admin (should redirect to not-authorized)
   - Log in as an approved admin and check admin dashboard access
   - Log in as a pending admin and verify redirect to pending-approval page

5. Test UI conditional rendering:
   - Verify that the homepage hides admin/superadmin cards for regular users
   - Verify that navigation links are shown/hidden based on role

## Implementation Details

- Middleware.js handles route protection
- ProfileFetcher.js provides authentication state throughout the app
- RLS policies in Supabase control data access
- UI components use role checks for conditional rendering

## Environment Setup

The application requires a Supabase project with the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Database Tables

- `profiles`: Stores user roles and approval status
- `products`: Menu items
- `orders` and `order_items`: Order data
- `gift_cards`: Gift card information
- `loyalty_transactions`: Loyalty points history
- `tables`: Table management for QR codes

## License

Copyright © 2024 Art Coffee
