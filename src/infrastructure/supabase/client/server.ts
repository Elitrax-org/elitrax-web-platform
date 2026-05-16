import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { publicEnvironment } from "@/lib/config/environment";

/**
 * Server-side Supabase client bound to the current request cookies.
 * Throws when Supabase env vars are missing — callers must guard with
 * `isSupabaseConfigured()` for fallback paths (e.g. dev without backend).
 */
export async function createSupabaseServerClient() {
  const supabaseUrl = publicEnvironment.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    publicEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // The Server Component cookie setter throws when invoked outside a Server Action.
          // The middleware already refreshes the session, so swallow safely.
        }
      },
    },
  });
}
