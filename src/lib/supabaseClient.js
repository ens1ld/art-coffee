import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check for missing Supabase credentials to provide better error messages
if (!supabaseUrl) {
  console.error('NEXT_PUBLIC_SUPABASE_URL is not defined. Please check your environment variables.');
}

if (!supabaseAnonKey) {
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined. Please check your environment variables.');
}

// Create client with default empty strings if keys are missing to prevent runtime errors
export const supabase = createBrowserClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
)
