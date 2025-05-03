# Art Coffee

Art Coffee is a Next.js application with Supabase backend for a coffee ordering and loyalty system.

## Features

- **User Authentication**: Login, signup, and role-based access
- **Order System**: Custom coffee ordering with various options
- **Gift Cards**: Purchase and redeem gift cards 
- **Loyalty Program**: Earn and redeem loyalty points
- **Favorites**: Save your favorite coffee products
- **Admin Dashboard**: Manage orders and users
- **Superadmin Panel**: System-wide configuration

## Tech Stack

- **Frontend**: Next.js 13+ with App Router
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Hosting**: Vercel

## Project Structure

```
art-coffee/
├── src/
│   ├── app/                   # Next.js app router pages
│   │   ├── admin/             # Admin dashboard
│   │   ├── auth/              # Authentication pages
│   │   ├── bulk-order/        # Bulk order page
│   │   ├── gift-card/         # Gift card page
│   │   ├── loyalty/           # Loyalty page
│   │   ├── order/             # Order page
│   │   ├── profile/           # User profile page
│   │   ├── superadmin/        # Superadmin dashboard
│   │   └── page.js            # Home page
│   ├── components/            # Reusable React components
│   │   ├── Footer.js          
│   │   ├── Navigation.js      
│   │   └── ProfileFetcher.js  # User context provider
│   ├── lib/                   # Utility functions and configuration
│   │   └── supabaseClient.js  # Supabase client
│   └── middleware.js          # Next.js middleware for auth
└── supabase/                  # Supabase setup and migrations
    └── migrations/            # SQL migrations
```

## Role-Based Access

- **User**: Can access order, gift card, loyalty, and profile pages
- **Admin**: Additional access to admin dashboard 
- **Superadmin**: Full access including superadmin panel

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Run the development server:
   ```
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This project is deployed on Vercel.

## Database Schema

### Core Tables
- **users**: Authentication and user management
- **profiles**: Extended user information and roles
- **products**: Coffee and other products
- **orders**: Customer orders
- **order_items**: Individual items in orders
- **gift_cards**: Gift card information
- **loyalty_transactions**: Loyalty point tracking
- **favorites**: Users' favorite products

## License

Copyright © 2024 Art Coffee
