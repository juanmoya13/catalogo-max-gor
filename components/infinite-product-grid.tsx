"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AddToCartButton } from "@/components/add-to-cart-button";
import type { PublicProduct, SortBy } from "@/lib/catalog/public";

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

function buildQuery({ search, sort, selectedValues, offset }: QueryState) {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  params.set("sortBy", sort);
  selectedValues.forEach((valueId) => params.append("filterValues", valueId));
  params.set("offset", String(offset));
  params.set("limit", String(PAGE_SIZE));

  return params.toString();
}

type QueryState = {
  search: string;
  sort: SortBy;
  selectedValues: string[];
  offset: number;
};

type InfiniteProductGridProps = {
  initialProducts: PublicProduct[];
  initialHasMore: boolean;
  search: string;
  sort: SortBy;
  selectedValues: string[];
};

export function InfiniteProductGrid({
  initialProducts,
  initialHasMore,
  search,
  sort,
  selectedValues,
}: InfiniteProductGridProps) {
  const [products, setProducts] = useState(initialProducts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) {
      return undefined;
    }

    const loadMore = async () => {
      if (loadingRef.current) {
        return;
      }

      loadingRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const query = buildQuery({ search, sort, selectedValues, offset: products.length });
        const response = await fetch(`/api/catalog/products?${query}`);

        if (!response.ok) {
          throw new Error("No se pudieron cargar más productos.");
        }

        const result = (await response.json()) as { products?: PublicProduct[]; hasMore?: boolean };
        const nextProducts = result.products ?? [];

        setProducts((currentProducts) => {
          const productIds = new Set(currentProducts.map((product) => product.id));
          return [...currentProducts, ...nextProducts.filter((product) => !productIds.has(product.id))];
        });
        setHasMore(Boolean(result.hasMore));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar más productos.");
      } finally {
        loadingRef.current = false;
        setIsLoading(false);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, products.length, retryToken, search, selectedValues, sort]);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => {
          const image = product.fotografias[0]?.url_imagen;
          const primaryFilters = product.filtros.slice(0, 2);

          return (
            <article key={product.id} className="flex flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50">
              <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-slate-950">
                {image ? (
                  <Image src={image} alt={product.nombre} fill unoptimized className="object-cover transition duration-300 hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-medium text-slate-500">Sin imagen</div>
                )}
                <span className="absolute right-4 top-4 inline-flex rounded-full bg-orange-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">Nuevo</span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="mt-2 text-xl font-bold uppercase text-white">{product.nombre}</h3>
                  <p className="text-right font-bold text-white">{formatCurrency(product.precio)}</p>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-400">{product.descripcion || "Sin descripción disponible."}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {primaryFilters.length > 0 ? primaryFilters.map((filter) => (
                    <span key={`${product.id}-${filter.valor_filtro_id}`} className="rounded-full border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-slate-200">{filter.valor}</span>
                  )) : <span className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Sin filtros</span>}
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <AddToCartButton product={product} label="Agregar al carrito" className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-orange-600" />
                  <Link href={`/producto/${product.id}`} className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:border-orange-500 hover:text-orange-300">Ver detalle</Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div ref={sentinelRef} className="flex min-h-12 items-center justify-center pt-8" aria-live="polite">
        {isLoading && <p className="text-sm text-slate-400">Cargando más productos...</p>}
        {!isLoading && error && (
          <button type="button" onClick={() => setRetryToken((current) => current + 1)} className="text-sm font-bold uppercase tracking-[0.12em] text-orange-500 hover:text-orange-300">Reintentar</button>
        )}
        {!isLoading && !error && !hasMore && products.length > 0 && <p className="text-sm text-slate-500">No hay más productos.</p>}
      </div>
    </>
  );
}