import Link from "next/link";

const statusCards = [
  {
    title: "Supabase",
    description: "Base de datos relacional, autenticación y storage para el catálogo.",
  },
  {
    title: "Autenticación",
    description: "Middleware en Next.js que protege /admin/* y redirige a login.",
  },
  {
    title: "Migraciones",
    description: "Esquema de productos, fotografías, filtros y relaciones predefinidas.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <header className="flex w-full items-center justify-between gap-4 border-b border-slate-800 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-base font-black text-slate-950">
              C
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-500">
                Catálogo
              </p>
              <p className="text-sm text-slate-300">MVP • Fundación</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
            <Link href="/" className="transition hover:text-white">Inicio</Link>
            <Link href="/login" className="transition hover:text-white">Admin</Link>
          </nav>
        </header>

        <section className="grid gap-10 py-16 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-400">
              01 / Fundación técnica
            </p>
            <h1 className="mt-5 text-5xl font-black uppercase leading-none tracking-tighter text-white md:text-7xl">
              Catálogo
              <span className="block text-orange-500">listo para crecer</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300">
              Base segura para administrar productos, filtros, fotografías y acceso administrativo con Next.js y Supabase.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-orange-600"
              >
                Panel admin
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:border-orange-500 hover:text-orange-300"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl shadow-orange-500/10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
              Infraestructura
            </p>
            <div className="mt-5 space-y-4">
              {statusCards.map(({ title, description }) => (
                <div key={title} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
