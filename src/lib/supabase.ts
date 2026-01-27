import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  'https://mablckeofkddwjgxhnbe.supabase.co',
  'sb_publishable_vwSCTSafeH1x6Up-w01skQ_oS8rj6Tg'
);
