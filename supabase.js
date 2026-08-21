import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfunjjpmrnijumeihctz.supabase.co';
const supabasePublishableKey = 'sb_publishable_gwGUFgU477xP0-zFBLZ-gw__why1S1L';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
