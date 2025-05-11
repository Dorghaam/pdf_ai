import { createBrowserClient } from '@supabase/ssr';

// TODO: Set your Supabase URL and Anon Key in .env.local and on Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  // In a real app, you might want to throw an error or handle this more gracefully.
  // For the skeleton, console logs are fine.
  console.warn('Supabase URL or Anon Key is not set. Check your .env.local file.');
}

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}