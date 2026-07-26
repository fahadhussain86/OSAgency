import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-only. Uses the service role key to bypass RLS for actions that must be
// gated by application logic instead of a client-writable policy (e.g. chat
// moderation, where no client-side INSERT policy exists on ChatMessage on purpose).
// Never import this file from a "use client" component.
export function createAdminClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}
