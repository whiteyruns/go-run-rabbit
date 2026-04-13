import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

let _client: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_ANON_KEY must be set");
  }
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseKey);
  }
  return _client;
}
