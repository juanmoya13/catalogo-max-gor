import Image from "next/image";
import Link from "next/link";

import { InfiniteProductGrid } from "@/components/infinite-product-grid";
import {
  listPublicFilters,
  listPublicProducts,
  normalizeFilterValueSelection,
  normalizeSearchQuery,
  normalizeSortBy,
} from "@/lib/catalog/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const PAGE_SIZE = 8;

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const params = (await Promise.resolve(searchParams ?? {})) as Record<string, string | string[] | undefined>;

  const search = normalizeSearchQuery(params.search);
  const selectedValues = normalizeFilterValueSelection(params.filterValues);
  const sortBy = normalizeSortBy(params.sortBy);
  const [filters, productsWithLookahead] = await Promise.all([
    listPublicFilters(),
    listPublicProducts({
      searchQuery: search,
      filterValues: selectedValues,
      sortBy,
      limit: PAGE_SIZE + 1,
    }),
  ]);

  const products = productsWithLookahead.slice(0, PAGE_SIZE);
  const hasMore = productsWithLookahead.length > PAGE_SIZE;
  const productsLabel = products.length === 1 ? "producto cargado" : "productos cargados";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="w-full bg-orange-500 text-black text-xs font-bold uppercase flex justify-center items-center py-2 gap-4">
        <span>Envio por WhatsApp</span>
        <span>•</span>
        <span>Consulta inmediata</span>
      </header>

      <nav className="sticky top-0 z-50 w-full bg-black flex justify-between items-center border-b border-gray-800 px-4 py-4 md:px-8">
        <Link href="/" className="text-sm font-black uppercase tracking-[0.28em] text-orange-500">
          <Image src="/icon.png" alt="Logo" width={32} height={32} className="inline-block mr-2" />
          MaxGor
        </Link>
      </nav>
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-4 md:px-8">
        <section className="pt-10 md:pt-14">
            <div>
              <h1 className="text-6xl font-black uppercase tracking-tighter leading-none text-white md:text-8xl">
                Conectá con lo que 
                <span className="block text-orange-500">te gusta</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-slate-300">
                Tu dosis diaria de tecnología, coleccionables y accesorios. Elegí lo que quieras y completá tu compra de forma directa por WhatsApp.
              </p>
            </div>
        </section>

        <section id="catalogo" className="mt-12 grid gap-8 xl:grid-cols-[320px_1fr]">
          <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-indigo-400">Filtros</p>
            <form method="get" className="mt-5 space-y-5">
              <div>
                <label htmlFor="search" className="mb-2 block text-sm text-slate-300">
                  Buscar producto
                </label>
                <input
                  id="search"
                  name="search"
                  defaultValue={search}
                  placeholder="Ej: remera, campera"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="sortBy" className="mb-2 block text-sm text-slate-300">
                  Ordenar por
                </label>
                <select
                  id="sortBy"
                  name="sortBy"
                  defaultValue={sortBy}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="recientes">Más recientes</option>
                  <option value="alfabetico">Nombre A-Z</option>
                  <option value="precio_asc">Precio menor a mayor</option>
                  <option value="precio_desc">Precio mayor a menor</option>
                </select>
              </div>

              {filters.length > 0 && (
                <div className="space-y-5">
                  {filters.map((filter) => (
                    <div key={filter.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3">
                      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300">
                        {filter.nombre}
                      </p>
                      <div className="space-y-2">
                        {filter.valores.map((value) => {
                          const checked = selectedValues.includes(value.id);

                          return (
                            <label
                              key={value.id}
                              className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-orange-500/60"
                            >
                              <span>{value.valor}</span>
                              <input
                                type="checkbox"
                                name="filterValues"
                                value={value.id}
                                defaultChecked={checked}
                                className="h-4 w-4 accent-orange-500"
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-orange-600"
                >
                  Aplicar filtros
                </button>
                {(search || selectedValues.length > 0 || sortBy !== "recientes") && (
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-slate-200 transition hover:border-orange-500 hover:text-white"
                  >
                    Limpiar
                  </Link>
                )}
              </div>
            </form>
          </aside>

          <section>
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-indigo-400">Resultados</p>
                <h2 className="mt-2 text-3xl font-bold uppercase text-white">Colección</h2>
              </div>
              <p className="text-sm text-slate-300">
                {products.length} {productsLabel}
              </p>
            </div>

            {!isSupabaseConfigured() ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">
                <p className="text-lg font-bold uppercase tracking-[0.18em] text-orange-500">Catálogo sin datos</p>
                <p className="mt-3 text-slate-300">
                  Configura SUPABASE_URL y SUPABASE_ANON_KEY para ver el catálogo real.
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-12 text-center">
                <p className="text-2xl font-black uppercase tracking-tight text-white">Sin resultados</p>
                <p className="mt-3 text-slate-300">Probá otra búsqueda o limpia los filtros aplicados.</p>
              </div>
            ) : (
              <InfiniteProductGrid
                key={`${search}|${sortBy}|${selectedValues.join(",")}`}
                initialProducts={products}
                initialHasMore={hasMore}
                search={search}
                sort={sortBy}
                selectedValues={selectedValues}
              />
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
