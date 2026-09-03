import { createBrowserClient } from "@supabase/ssr";

import { assertSupabaseConfig, isSupabaseConfigured } from "./config";

export function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { url, anonKey } = assertSupabaseConfig();

  return createBrowserClient(url, anonKey);
}
