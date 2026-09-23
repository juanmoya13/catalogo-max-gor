"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AddToCartButton } from "@/components/add-to-cart-button";
import type { PublicProduct, SortBy } from "@/lib/catalog/public";

const PAGE_SIZE = 8;
const CATALOG_STATE_PREFIX = "catalogo:catalog-state:";
const CATALOG_STATE_TTL = 30 * 60 * 1000;

type CatalogSnapshot = {
  products: PublicProduct[];
  hasMore: boolean;
  scrollY: number;
  savedAt: number;
};

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

function getCatalogStateKey() {
  return `${CATALOG_STATE_PREFIX}${window.location.pathname}${window.location.search}`;
}

function readCatalogSnapshot(): CatalogSnapshot | null {
  try {
    const rawSnapshot = sessionStorage.getItem(getCatalogStateKey());
    if (!rawSnapshot) {
      return null;
    }

    const snapshot = JSON.parse(rawSnapshot) as CatalogSnapshot;
    if (
      !Array.isArray(snapshot.products) ||
      typeof snapshot.hasMore !== "boolean" ||
      typeof snapshot.scrollY !== "number" ||
      typeof snapshot.savedAt !== "number" ||
      Date.now() - snapshot.savedAt > CATALOG_STATE_TTL
    ) {
      sessionStorage.removeItem(getCatalogStateKey());
      return null;
    }

    return snapshot;
  } catch {
    return null;
  }
}

function writeCatalogSnapshot(snapshot: Omit<CatalogSnapshot, "savedAt">) {
  try {
    sessionStorage.setItem(
      getCatalogStateKey(),
      JSON.stringify({ ...snapshot, savedAt: Date.now() }),
    );
  } catch {
    return;
  }
}

export function InfiniteProductGrid({
  initialProducts,
  initialHasMore,
  search,
  sort,
  selectedValues,
}: InfiniteProductGridProps) {
  const [products, setProducts] = useState(initialProducts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isRestoring, setIsRestoring] = useState(true);
  const [restoreScrollY, setRestoreScrollY] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const productsRef = useRef(products);
  const hasMoreRef = useRef(hasMore);

  const saveCurrentState = (scrollY: number) => {
    writeCatalogSnapshot({
      products: productsRef.current,
      hasMore: hasMoreRef.current,
      scrollY,
    });
  };

  useEffect(() => {
    productsRef.current = products;
    hasMoreRef.current = hasMore;
  }, [hasMore, products]);

  useEffect(() => {
    const snapshot = readCatalogSnapshot();
    queueMicrotask(() => {
      if (snapshot) {
        setProducts(snapshot.products);
        setHasMore(snapshot.hasMore);
        setRestoreScrollY(snapshot.scrollY);
      }

      setIsRestoring(false);
    });
  }, []);

  useEffect(() => {
    if (restoreScrollY === null || isRestoring) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: restoreScrollY, behavior: "auto" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isRestoring, products.length, restoreScrollY]);

  useEffect(() => {
    let frame = 0;

    const saveScrollPosition = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        saveCurrentState(window.scrollY);
      });
    };

    window.addEventListener("scroll", saveScrollPosition, { passive: true });
    return () => {
      window.removeEventListener("scroll", saveScrollPosition);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (isRestoring || !sentinel || !hasMore) {
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
        const query = buildQuery({ search, sort, selectedValues, offset: productsRef.current.length });
        const response = await fetch(`/api/catalog/products?${query}`);

        if (!response.ok) {
          throw new Error("No se pudieron cargar más productos.");
        }

        const result = (await response.json()) as { products?: PublicProduct[]; hasMore?: boolean };
        const nextProducts = result.products ?? [];
        const productIds = new Set(productsRef.current.map((product) => product.id));
        const mergedProducts = [...productsRef.current, ...nextProducts.filter((product) => !productIds.has(product.id))];
        const nextHasMore = Boolean(result.hasMore);

        productsRef.current = mergedProducts;
        hasMoreRef.current = nextHasMore;
        setProducts(mergedProducts);
        setHasMore(nextHasMore);
        saveCurrentState(window.scrollY);
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
  }, [hasMore, isRestoring, retryToken, search, selectedValues, sort]);

  return (
    <>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => {
          const image = product.fotografias[0]?.url_imagen;
          const primaryFilters = product.filtros.slice(0, 2);

          return (
            <article key={product.id} className="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50">
              <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-slate-950">
                {image ? (
                  <Image src={image} alt={product.nombre} fill unoptimized className="object-cover transition duration-300 hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-medium text-slate-500">Sin imagen</div>
                )}
                <span className="absolute right-4 top-4 inline-flex rounded-full bg-orange-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">Nuevo</span>
              </div>

              <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <h3 className="min-w-0 break-words text-base font-bold uppercase text-white sm:text-xl">{product.nombre}</h3>
                  <p className="max-w-full break-words text-left font-bold text-white sm:text-right">{formatCurrency(product.precio)}</p>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-400">{product.descripcion || "Sin descripción disponible."}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {primaryFilters.length > 0 ? primaryFilters.map((filter) => (
                    <span key={`${product.id}-${filter.valor_filtro_id}`} className="rounded-full border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-slate-200">{filter.valor}</span>
                  )) : <span className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Sin filtros</span>}
                </div>
                <div className="mt-auto flex flex-col gap-3 pt-6">
                  <AddToCartButton product={product} label="Agregar al carrito" className="inline-flex min-h-11 w-full min-w-0 items-center justify-center whitespace-normal rounded-xl bg-orange-500 px-2 py-3 text-xs font-bold uppercase leading-tight tracking-[0.12em] text-white transition hover:bg-orange-600 sm:px-4 sm:text-sm" />
                  <Link
                    href={`/producto/${product.id}`}
                    onClick={() => saveCurrentState(window.scrollY)}
                    className="inline-flex min-h-11 w-full min-w-0 items-center justify-center whitespace-normal rounded-xl border border-slate-700 bg-slate-950 px-2 py-3 text-xs font-bold uppercase leading-tight tracking-[0.12em] text-white transition hover:border-orange-500 hover:text-orange-300 sm:px-4 sm:text-sm"
                  >
                    Ver detalle
                  </Link>
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
