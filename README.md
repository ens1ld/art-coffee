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

## Translation System Documentation

Art Coffee now supports multiple languages throughout the application. The system allows for seamless switching between languages while maintaining a consistent user experience.

### Currently Supported Languages

- English (Default)
- Albanian (Shqip)

### How to Use Translations

#### For Users

Users can change the language by clicking on the language switcher in the navigation bar. The switcher displays the current language with its flag. The selected language preference is stored in the browser's localStorage and persists between visits.

#### For Developers

##### Translation Context

The translation system uses React Context API to manage translations across the application:

- `src/context/LanguageContext.js` - Contains all translation strings and the context logic.
- `src/components/ClientLanguageProvider.js` - Client-side wrapper for the LanguageProvider.

##### Adding New Translations

To add a new translation key:

1. Open `src/context/LanguageContext.js`
2. Add the new key and its translation to both language objects:
   ```javascript
   const en = {
     // existing translations
     new_key: 'English translation',
   };

   const sq = {
     // existing translations
     new_key: 'Albanian translation',
   };
   ```

##### Using Translations in Components

To use translations in a component:

```javascript
import { useLanguage } from '@/context/LanguageContext';

function MyComponent() {
  const { translations } = useLanguage();
  
  return <div>{translations.my_key}</div>;
}
```

##### Adding a New Language

To add a new language:

1. Create a new translation object in `LanguageContext.js`:
   ```javascript
   const de = {
     // Add all translation keys with German translations
   };
   ```

2. Update the language switcher in `LanguageSwitcher.js` to include the new language.

3. Update the context provider to support the new language:
   ```javascript
   const translations = 
     language === 'sq' ? sq : 
     language === 'de' ? de : 
     en;
   ```

### File Structure

- `src/context/LanguageContext.js` - Main context file with all translations
- `src/components/ClientLanguageProvider.js` - Client-side wrapper
- `src/components/LanguageSwitcher.js` - UI component for changing language
- `src/app/layout.js` - Root layout where the language provider is injected

### Translation Categories

Translations are organized into categories:

- **Navigation:** Nav bar elements
- **Homepage:** Home page content
- **Profile Page:** User profile sections
- **Order Page:** Order menu and cart
- **Common UI:** Shared elements across the app
- **Footer:** Footer links and content
