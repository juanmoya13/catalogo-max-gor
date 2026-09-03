import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { assertSupabaseConfig, isSupabaseConfigured } from "./config";

export async function createServerComponentClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { url, anonKey } = assertSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // The server component cannot write cookies during render.
        }
      },
    },
  });
}

export async function createServerActionClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { url, anonKey } = assertSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // The server action can handle cookie persistence correctly.
        }
      },
    },
  });
}
