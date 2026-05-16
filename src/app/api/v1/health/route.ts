import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/config/environment";

/**
 * Healthcheck básico de API con estado de persistencia activa.
 */
export async function GET() {
  const supabaseConfigured = isSupabaseConfigured();

  return NextResponse.json({
    status: "ok",
    persistence: supabaseConfigured ? "supabase" : "in-memory",
    supabaseConfigured,
    timestamp: new Date().toISOString(),
  });
}
