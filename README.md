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

## Database Tables

- `profiles`: Stores user roles and approval status
- `products`: Menu items
- `orders` and `order_items`: Order data
- `gift_cards`: Gift card information
- `loyalty_transactions`: Loyalty points history
- `tables`: Table management for QR codes

## License

Copyright © 2024 Art Coffee

## Translation System Documentation

Art Coffee now supports multiple languages throughout the application. The system allows for seamless switching between languages while maintaining a consistent user experience.

### Currently Supported Languages

- English (Default)
- Albanian (Shqip)

### How to Use Translations

#### For Users

Users can change the language by clicking on the language switcher in the navigation bar. The switcher displays the current language with its flag. The selected language preference is stored in the browser's localStorage and persists between visits.

### Using the Favorites Feature

- Users can toggle product favorites by clicking the heart icon on any product card
- Favorite products appear in the user's profile under the "Favorites" tab
- The feature requires user authentication
- Favorites are stored per user and persist between sessions
