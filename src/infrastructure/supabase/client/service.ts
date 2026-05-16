import { createClient } from "@supabase/supabase-js";

import {
  publicEnvironment,
  serverEnvironment,
} from "@/lib/config/environment";

/**
 * Service-role Supabase client. MUST only be used in trusted server
 * contexts (route handlers, server actions, Edge Functions). Never ship to
 * the browser. Throws if the service role key is missing.
 */
export function createSupabaseServiceClient() {
  const supabaseUrl = publicEnvironment.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = serverEnvironment.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase service-role environment variables are not configured.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
