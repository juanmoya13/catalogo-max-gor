"use server";

import { redirect } from "next/navigation";

import { createServerActionClient, createServerComponentClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function logoutAction() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const supabase = await createServerActionClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}

export async function getAdminSession() {
  if (!isSupabaseConfigured()) {
    return { authenticated: false };
  }

  const supabase = await createServerComponentClient();

  if (!supabase) {
    return { authenticated: false };
  }

  const { data, error } = await supabase.auth.getUser();

  return {
    authenticated: !error && Boolean(data.user),
    user: data.user ? { email: data.user.email } : null,
  };
}
