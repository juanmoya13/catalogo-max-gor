"use server";

import { redirect } from "next/navigation";

import { createServerActionClient, createServerComponentClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type LoginState = {
  error?: string;
  message?: string;
};

export async function loginAction(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  if (!isSupabaseConfigured()) {
    return {
      error: "Falta configurar Supabase para iniciar sesión. Revisa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Debes completar email y contraseña." };
  }

  const supabase = await createServerActionClient();

  if (!supabase) {
    return {
      error: "La configuración de Supabase no está disponible para esta sesión.",
    };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/admin");
}

export async function getLoginStatus() {
  if (!isSupabaseConfigured()) {
    return { configured: false };
  }

  const supabase = await createServerComponentClient();

  if (!supabase) {
    return { configured: false };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { configured: true, user: user ? { email: user.email } : null };
}
