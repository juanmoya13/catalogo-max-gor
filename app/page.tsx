import Image from "next/image";
import Link from "next/link";

import {
  listPublicFilters,
  listPublicProducts,
  normalizeFilterValueSelection,
  normalizeSearchQuery,
  normalizeSortBy,
} from "@/lib/catalog/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const PAGE_SIZE = 8;

function formatCurrency(value: number | null) {
  if (value === null || value === undefined) {
    return "A consultar";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildCatalogHref({
  search,
  sort,
  selectedValues,
  pageOffset,
}: {
  search: string;
  sort: string;
  selectedValues: string[];
  pageOffset: number;
}) {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  if (sort) {
    params.set("sortBy", sort);
  }

  selectedValues.forEach((valueId) => params.append("filterValues", valueId));

  if (pageOffset > 0) {
    params.set("offset", String(pageOffset));
  }

  const queryString = params.toString();
  return queryString ? `/?${queryString}` : "/";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const params = (await Promise.resolve(searchParams ?? {})) as Record<string, string | string[] | undefined>;

  const search = normalizeSearchQuery(params.search);
  const selectedValues = normalizeFilterValueSelection(params.filterValues);
  const sortBy = normalizeSortBy(params.sortBy);
  const offset = Math.max(Number(params.offset ?? 0), 0);

  const [filters, allProducts] = await Promise.all([
    listPublicFilters(),
    listPublicProducts({
      searchQuery: search,
      filterValues: selectedValues,
      sortBy,
      limit: Number.MAX_SAFE_INTEGER,
    }),
  ]);

  const products = allProducts.slice(offset, offset + PAGE_SIZE);
  const hasMore = offset + PAGE_SIZE < allProducts.length;
  const productsLabel = allProducts.length === 1 ? "producto" : "productos";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="w-full bg-orange-500 text-black text-xs font-bold uppercase flex justify-center items-center py-2 gap-4">
        <span>Envio por WhatsApp</span>
        <span>•</span>
        <span>Consulta inmediata</span>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-4 md:px-8">
        <nav className="flex justify-between items-center border-b border-gray-800 py-4">
          <Link href="/" className="text-sm font-black uppercase tracking-[0.28em] text-orange-500">
            Catálogo
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link href="/" className="transition hover:text-white">Inicio</Link>
            <Link href="/admin" className="transition hover:text-white">Admin</Link>
          </div>
        </nav>

        <section className="pt-10 md:pt-14">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-indigo-400">01 / La colección</p>
          <div className="mt-6 grid gap-10 md:grid-cols-[1.15fr_0.85fr] md:items-end">
            <div>
              <h1 className="text-6xl font-black uppercase tracking-tighter leading-none text-white md:text-8xl">
                Ropa para
                <span className="block text-orange-500">el día a día</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-slate-300">
                Descubrí prendas con estilo sobrio, materiales de calidad y una compra directa pensada para WhatsApp.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl shadow-orange-500/10">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-orange-500">Novedades</p>
              <p className="mt-4 text-3xl font-black uppercase tracking-tight text-white">Apparel for the driven</p>
              <div className="mt-6 flex gap-3">
                <Link
                  href="#catalogo"
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-orange-600"
                >
                  Ver colección
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:border-orange-500 hover:text-orange-300"
                >
                  Admin
                </Link>
              </div>
            </div>
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
                {allProducts.length} {productsLabel} disponibles
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
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => {
                    const image = product.fotografias[0]?.url_imagen;
                    const primaryFilters = product.filtros.slice(0, 2);

                    return (
                      <article key={product.id} className="flex flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50">
                        <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-slate-950">
                          {image ? (
                            <Image
                              src={image}
                              alt={product.nombre}
                              fill
                              unoptimized
                              className="object-cover transition duration-300 hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-medium text-slate-500">
                              Sin imagen
                            </div>
                          )}
                          <span className="absolute right-4 top-4 inline-flex rounded-full bg-orange-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                            Nuevo
                          </span>
                        </div>

                        <div className="flex flex-1 flex-col p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-400">Colección</p>
                              <h3 className="mt-2 text-xl font-bold uppercase text-white">{product.nombre}</h3>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-bold">{formatCurrency(product.precio)}</p>
                            </div>
                          </div>

                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-400">
                            {product.descripcion || "Sin descripción disponible."}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {primaryFilters.length > 0 ? (
                              primaryFilters.map((filter) => (
                                <span
                                  key={`${product.id}-${filter.valor_filtro_id}`}
                                  className="rounded-full border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-slate-200"
                                >
                                  {filter.valor}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Sin filtros</span>
                            )}
                          </div>

                          <Link
                            href={`/producto/${product.id}`}
                            className="mt-6 inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:border-orange-500 hover:text-orange-300"
                          >
                            Ver detalle
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <Link
                      href={buildCatalogHref({
                        search,
                        sort: sortBy,
                        selectedValues,
                        pageOffset: offset + PAGE_SIZE,
                      })}
                      className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-orange-600"
                    >
                      Cargar más productos
                    </Link>
                  </div>
                )}
              </>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
