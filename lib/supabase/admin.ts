import { createClient } from '@supabase/supabase-js';

// TODO: Set your Supabase URL and Service Role Key in .env (for server-side) and on Vercel (secret)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!; // Can reuse public URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  // console.warn('Supabase URL or Service Role Key is not set for admin client. Check your environment variables.');
  // This client is critical for backend operations; consider throwing if not configured in production.
}

// Note: Using the service_role key bypasses RLS.
// Use with caution and only on the server-side for trusted operations.
export function createAdminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase admin client is not configured. Missing URL or Service Role Key.');
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false, // Don't persist session for admin client
      autoRefreshToken: false,
    }
  });
}