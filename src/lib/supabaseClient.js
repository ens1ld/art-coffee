import { createBrowserClient } from '@supabase/ssr'

// Get environment variables with fallbacks to prevent runtime errors
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Check for missing environment variables in development only
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Missing Supabase environment variables. Check your .env.local file.')
}

// Create and export the Supabase client
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Helper function to check if a user is authenticated
export async function isAuthenticated() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  } catch (error) {
    console.error('Auth check error:', error)
    return false
  }
}

// Helper function to get user role
export async function getUserRole() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
      
    return profile?.role || null
  } catch (error) {
    console.error('Get role error:', error)
    return null
  }
}
