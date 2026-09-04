export function isSupabaseConfigured() {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY,
  );
}

export function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL ?? "";
  const anonKey = process.env.SUPABASE_ANON_KEY ?? "";

  return { url, anonKey };
}

export function assertSupabaseConfig() {
  const { url, anonKey } = getSupabaseConfig();

  if (!url || !anonKey) {
    throw new Error(
      "Supabase no está configurado. Agrega SUPABASE_URL y SUPABASE_ANON_KEY.",
    );
  }

  return { url, anonKey };
}
