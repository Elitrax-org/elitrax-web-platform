import { createBrowserClient } from "@supabase/ssr";

import { publicEnvironment } from "@/lib/config/environment";

export function createSupabaseBrowserClient() {
  const supabaseUrl = publicEnvironment.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = publicEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}