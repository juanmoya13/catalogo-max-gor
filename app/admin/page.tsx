import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  createFilterAction,
  createProductAction,
  deleteFilterAction,
  deleteProductAction,
  getAdminSession,
  listFilters,
  listProducts,
  logoutAction,
  updateFilterAction,
  updateProductAction,
} from "./actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  if (!isSupabaseConfigured()) {
    redirect("/login?error=missing_supabase");
  }

  const session = await getAdminSession();

  if (!session.authenticated) {
    redirect("/login");
  }

  const params = (await Promise.resolve(searchParams ?? {})) as Record<string, string | string[] | undefined>;
  const filters = await listFilters();
  const products = await listProducts();
  const successMessage = params.success ? String(params.success) : "";
  const errorMessage = params.error ? String(params.error) : "";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-slate-800 pb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-500">Backoffice</p>
            <h1 className="mt-3 text-4xl font-black uppercase tracking-tight text-white">Catálogo administrativo</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
              Sesión activa
            </span>
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

        {(successMessage || errorMessage) && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            {successMessage ? (
              <p className="text-sm font-medium text-emerald-300">Acción exitosa: {successMessage}</p>
            ) : null}
            {errorMessage ? (
              <p className="text-sm font-medium text-red-300">Error: {decodeURIComponent(errorMessage)}</p>
            ) : null}
          </div>
        )}

        <div className="mt-8 grid gap-8 xl:grid-cols-[0.95fr_1.35fr]">
          <aside className="space-y-8">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-indigo-400">Crear filtro</p>
              <h2 className="mt-3 text-2xl font-bold uppercase text-white">Taxonomía</h2>
              <form action={createFilterAction} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="filter-name" className="mb-2 block text-sm text-slate-300">Nombre del filtro</label>
                  <input id="filter-name" name="nombre" required className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-orange-500 focus:outline-none" placeholder="Ej: Talle, Color" />
                </div>
                <div>
                  <label htmlFor="filter-values" className="mb-2 block text-sm text-slate-300">Valores iniciales</label>
                  <textarea id="filter-values" name="valores" rows={4} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-orange-500 focus:outline-none" placeholder="M, L, XL&#10;Negro, Blanco" />
                </div>
                <button type="submit" className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-orange-600">
                  Crear filtro
                </button>
              </form>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-indigo-400">Nuevo producto</p>
              <h2 className="mt-3 text-2xl font-bold uppercase text-white">Alta de catálogo</h2>
              <form action={createProductAction} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="product-name" className="mb-2 block text-sm text-slate-300">Nombre</label>
                  <input id="product-name" name="nombre" required className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-orange-500 focus:outline-none" placeholder="Remera técnica" />
                </div>
                <div>
                  <label htmlFor="product-description" className="mb-2 block text-sm text-slate-300">Descripción</label>
                  <textarea id="product-description" name="descripcion" rows={3} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-orange-500 focus:outline-none" placeholder="Tela transpirable y corte moderno." />
                </div>
                <div>
                  <label htmlFor="product-price" className="mb-2 block text-sm text-slate-300">Precio</label>
                  <input id="product-price" name="precio" type="number" min="0" step="0.01" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-orange-500 focus:outline-none" placeholder="15000" />
                </div>
                <div>
                  <label htmlFor="product-images" className="mb-2 block text-sm text-slate-300">Fotografías</label>
                  <input id="product-images" name="images" type="file" multiple accept="image/*" className="w-full rounded-xl border border-dashed border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300 file:mr-4 file:rounded file:border-0 file:bg-orange-500 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white" />
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-300">Filtros opcionales</p>
                  {filters.length === 0 ? (
                    <p className="text-sm text-slate-400">Todavía no hay filtros creados.</p>
                  ) : (
                    filters.map((filter) => (
                      <div key={filter.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-white">{filter.nombre}</p>
                        <div className="flex flex-wrap gap-2">
                          {filter.valores?.length ? (
                            filter.valores.map((value) => (
                              <label key={value.id} className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-200">
                                <input type="checkbox" name="filter_values" value={`${filter.id}:${value.id}`} className="accent-orange-500"/>
                                {value.valor}
                              </label>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500">Sin valores cargados</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button type="submit" className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-orange-600">
                  Guardar producto
                </button>
              </form>
            </section>
          </aside>

          <section className="space-y-8">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-indigo-400">Filtros existentes</p>
              <div className="mt-5 space-y-4">
                {filters.length === 0 ? (
                  <p className="text-sm text-slate-400">No hay filtros todavía.</p>
                ) : (
                  filters.map((filter) => (
                    <div key={filter.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                      <form action={updateFilterAction} className="space-y-4">
                        <input type="hidden" name="filtro_id" value={filter.id} />
                        <div>
                          <label className="mb-2 block text-sm text-slate-300">Nombre</label>
                          <input name="nombre" defaultValue={filter.nombre} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-orange-500 focus:outline-none" />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm text-slate-300">Agregar valores</label>
                          <input name="nuevos_valores" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-orange-500 focus:outline-none" placeholder="XL, XXL, Negro" />
                        </div>
                        <div>
                          <p className="mb-2 text-sm text-slate-300">Valores actuales</p>
                          <div className="flex flex-wrap gap-2">
                            {filter.valores?.length ? (
                              filter.valores.map((value) => (
                                <label key={value.id} className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">
                                  <input type="checkbox" name="valores_a_eliminar" value={value.id} className="accent-red-500" />
                                  {value.valor}
                                </label>
                              ))
                            ) : (
                              <span className="text-xs text-slate-500">Sin valores asociados</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button type="submit" className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] text-white hover:bg-orange-600">Guardar</button>
                        </div>
                      </form>
                      <form action={deleteFilterAction} className="mt-3">
                        <input type="hidden" name="filtro_id" value={filter.id} />
                        <button type="submit" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/20">Eliminar filtro</button>
                      </form>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-indigo-400">Productos gestionados</p>
              <div className="mt-5 space-y-5">
                {products.length === 0 ? (
                  <p className="text-sm text-slate-400">Todavía no hay productos creados.</p>
                ) : (
                  products.map((product) => {
                    const selectedAssignments = new Set((product.filtros ?? []).map((assignment) => `${assignment.filtro_id}:${assignment.valor_filtro_id}`));

                    return (
                      <article key={product.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
                          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                            {product.fotografias?.[0]?.url_imagen ? (
                              <Image
                                src={product.fotografias[0].url_imagen}
                                alt={product.nombre}
                                width={1200}
                                height={900}
                                unoptimized
                                className="h-56 w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-56 items-center justify-center text-sm text-slate-400">Sin imagen</div>
                            )}
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="text-xl font-bold uppercase text-white">{product.nombre}</h3>
                                <p className="mt-1 text-sm text-slate-400">{product.descripcion || "Sin descripción"}</p>
                              </div>
                              <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-sm font-bold text-orange-300">
                                {product.precio != null ? `$${Number(product.precio).toLocaleString("es-AR")}` : "A consultar"}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                              {(product.filtros ?? []).length === 0 ? (
                                <span className="rounded-full border border-slate-700 px-2 py-1">Sin filtros</span>
                              ) : (
                                (product.filtros ?? []).map((assignment) => (
                                  <span key={`${product.id}-${assignment.valor_filtro_id}`} className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-1 text-orange-200">
                                    {assignment.valor}
                                  </span>
                                ))
                              )}
                            </div>

                            <form action={updateProductAction} className="space-y-4">
                              <input type="hidden" name="producto_id" value={product.id} />
                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <label className="mb-2 block text-sm text-slate-300">Nombre</label>
                                  <input name="nombre" defaultValue={product.nombre} required className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-orange-500 focus:outline-none" />
                                </div>
                                <div>
                                  <label className="mb-2 block text-sm text-slate-300">Precio</label>
                                  <input name="precio" type="number" min="0" step="0.01" defaultValue={product.precio ?? ""} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-orange-500 focus:outline-none" />
                                </div>
                              </div>
                              <div>
                                <label className="mb-2 block text-sm text-slate-300">Descripción</label>
                                <textarea name="descripcion" rows={3} defaultValue={product.descripcion ?? ""} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-orange-500 focus:outline-none" />
                              </div>
                              <div>
                                <label className="mb-2 block text-sm text-slate-300">Agregar nuevas fotografías</label>
                                <input name="images" type="file" multiple accept="image/*" className="w-full rounded-xl border border-dashed border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300 file:mr-4 file:rounded file:border-0 file:bg-orange-500 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white" />
                              </div>
                              <div>
                                <p className="mb-2 text-sm text-slate-300">Fotografías actuales</p>
                                <div className="flex flex-wrap gap-3">
                                  {(product.fotografias ?? []).map((photo) => (
                                    <div key={photo.id} className="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
                                      <Image
                                        src={photo.url_imagen}
                                        alt="Foto del producto"
                                        width={160}
                                        height={160}
                                        unoptimized
                                        className="h-20 w-20 object-cover"
                                      />
                                      <input type="hidden" name="existing_images" value={photo.url_imagen} />
                                      <label className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-slate-950/80 px-1 py-1 text-[10px] text-slate-200">
                                        <input type="checkbox" name="remove_photo_ids" value={photo.id} className="accent-red-500" />
                                        Quitar
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-3">
                                <p className="text-sm text-slate-300">Filtros asociados</p>
                                {filters.length === 0 ? (
                                  <p className="text-sm text-slate-400">No hay filtros disponibles.</p>
                                ) : (
                                  filters.map((filter) => (
                                    <div key={`product-${product.id}-${filter.id}`} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-white">{filter.nombre}</p>
                                      <div className="flex flex-wrap gap-2">
                                        {filter.valores?.length ? (
                                          filter.valores.map((value) => (
                                            <label key={`${product.id}-${filter.id}-${value.id}`} className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-200">
                                              <input type="checkbox" name="filter_values" value={`${filter.id}:${value.id}`} className="accent-orange-500" defaultChecked={selectedAssignments.has(`${filter.id}:${value.id}`)} />
                                              {value.valor}
                                            </label>
                                          ))
                                        ) : (
                                          <span className="text-xs text-slate-500">Sin opciones</span>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                              <div className="flex flex-wrap gap-3">
                                <button type="submit" className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] text-white hover:bg-orange-600">
                                  Guardar cambios
                                </button>
                              </div>
                            </form>

                            <form action={deleteProductAction} className="mt-3">
                              <input type="hidden" name="producto_id" value={product.id} />
                              <button type="submit" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/20">
                                Eliminar producto
                              </button>
                            </form>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 flex justify-end">
          <Link href="/" className="inline-flex items-center rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:border-orange-500 hover:text-orange-300">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
