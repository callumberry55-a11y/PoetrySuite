import { createClient } from '@supabase/supabase-js'

// Validate required Supabase environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  const missing = [];
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
  if (!supabaseKey) missing.push('VITE_SUPABASE_ANON_KEY');

  throw new Error(
    `Missing required Supabase environment variables: ${missing.join(', ')}. ` +
    `Please check your .env file.`
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey)