import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicProductById } from "@/lib/catalog/public";

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

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getPublicProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="w-full bg-orange-500 text-black text-xs font-bold uppercase flex justify-center items-center py-2 gap-4">
        <span>Envio por WhatsApp</span>
        <span>•</span>
        <span>Consulta inmediata</span>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <nav className="flex items-center justify-between border-b border-slate-800 pb-4">
          <Link href="/" className="text-sm font-black uppercase tracking-[0.28em] text-orange-500">
            Catálogo
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-300 transition hover:text-white">
            Volver a colección
          </Link>
        </nav>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-4">
            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60">
              {product.fotografias[0]?.url_imagen ? (
                <div className="relative aspect-[4/5]">
                  <Image
                    src={product.fotografias[0].url_imagen}
                    alt={product.nombre}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center text-slate-500">Sin imagen</div>
              )}
            </div>

            {product.fotografias.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {product.fotografias.map((photo, index) => (
                  <div key={`${photo.id}-${index}`} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
                    <div className="relative aspect-square">
                      <Image
                        src={photo.url_imagen}
                        alt={`${product.nombre} ${index + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-400">Producto</p>
            <h1 className="mt-3 text-4xl font-black uppercase tracking-tight text-white">{product.nombre}</h1>

            <div className="mt-5 flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-sm uppercase tracking-[0.18em] text-slate-400">Precio</span>
              <span className="text-2xl font-black text-white">{formatCurrency(product.precio)}</span>
            </div>

            <p className="mt-5 text-base leading-7 text-slate-300">
              {product.descripcion || "Este producto no incluye descripción disponible en este momento."}
            </p>

            {product.filtros.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Caracteristicas</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.filtros.map((filter) => (
                    <span
                      key={`${filter.filtro_id}-${filter.valor_filtro_id}`}
                      className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-200"
                    >
                      {filter.valor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Hola, me interesa ${product.nombre}. ¿Podés consultarme más información?`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-orange-600"
              >
                Consultar por WhatsApp
              </a>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-slate-200 transition hover:border-orange-500 hover:text-white"
              >
                Seguir comprando
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
