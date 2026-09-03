import Link from "next/link";
import { redirect } from "next/navigation";

import { getAdminSession, logoutAction } from "./actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const foundationChecklist = [
  "Next.js 16 con App Router y TypeScript",
  "Supabase conectado como repositorio central",
  "Bucket product-images preparado para fotos",
  "Middleware protegiendo /admin/*",
  "Migraciones SQL para productos, fotos y filtros",
  "RLS activo para lectura pública y escritura administrativa",
];

export default async function AdminPage() {
  if (!isSupabaseConfigured()) {
    redirect("/login?error=missing_supabase");
  }

  const session = await getAdminSession();

  if (!session.authenticated) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-slate-800 pb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-500">
              Panel Administrativo
            </p>
            <h1 className="mt-3 text-4xl font-black uppercase tracking-tight text-white">
              Fundación del catálogo
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
              Sesión activa
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-orange-500 hover:text-orange-400"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </header>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl shadow-orange-500/5">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
              Estado del proyecto
            </p>
            <h2 className="mt-4 text-2xl font-bold uppercase text-white">
              Incremento 1 — Fundación
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
              La infraestructura ya quedó preparada para incorporar el backoffice y el catálogo público. La aplicación usa una base técnica segura, con Supabase como origen de verdad, manejo de sesión en Next.js y protección de las rutas administrativas.
            </p>

            <ul className="mt-6 space-y-3">
              {foundationChecklist.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-200">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-black text-white">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
              Administrador
            </p>
            <div className="mt-5 rounded-xl border border-orange-500/25 bg-orange-500/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-orange-400">Email</p>
              <p className="mt-2 text-lg font-bold text-white">{session.user?.email ?? "Administrador"}</p>
            </div>

            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2">
                <span>Rutas protegidas</span>
                <span className="font-semibold text-emerald-300">OK</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2">
                <span>Supabase Auth</span>
                <span className="font-semibold text-emerald-300">Preparado</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2">
                <span>Storage bucket</span>
                <span className="font-semibold text-emerald-300">product-images</span>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/"
                className="inline-flex items-center rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-orange-600"
              >
                Volver al catálogo
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
