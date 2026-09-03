"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {
  error: "",
  message: "",
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-orange-500/10 backdrop-blur">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">
            Administración</p>
          <h1 className="mt-4 text-3xl font-black uppercase tracking-tight text-white">
            Iniciar sesión
          </h1>
          <p className="mt-3 text-sm text-slate-300">
            Acceso exclusivo para consolidar el catálogo y la configuración del negocio.
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              placeholder="admin@catalogo.local"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-200">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              placeholder="••••••••"
            />
          </div>

          {state.error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {state.error}
            </p>
          ) : null}

          {state.message ? (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {state.message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-400"
          >
            {isPending ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-800 pt-5 text-sm text-slate-400">
          <p>
            ¿Necesitas volver al catálogo?{' '}
            <Link href="/" className="font-medium text-orange-400 hover:text-orange-300">
              Ir al inicio
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
