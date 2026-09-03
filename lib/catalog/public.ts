import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerComponentClient } from "@/lib/supabase/server";

export type SortBy = "recientes" | "alfabetico" | "precio_asc" | "precio_desc";

export type PublicFilterValue = {
  id: string;
  filtro_id: string;
  valor: string;
};

export type PublicFilterGroup = {
  id: string;
  nombre: string;
  valores: PublicFilterValue[];
};

export type PublicProductFilter = {
  filtro_id: string;
  valor_filtro_id: string;
  valor?: string;
  filtro_nombre?: string;
};

export type PublicProduct = {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number | null;
  creado_at: string;
  fotografias: Array<{ id: string; url_imagen: string }>;
  filtros: PublicProductFilter[];
};

export function normalizeSearchQuery(input: string | string[] | undefined): string {
  if (Array.isArray(input)) {
    return input[0]?.trim() ?? "";
  }

  return String(input ?? "").trim();
}

export function normalizeFilterValueSelection(input: string | string[] | undefined): string[] {
  if (!input) {
    return [];
  }

  const values = Array.isArray(input) ? input : [input];

  return values
    .flatMap((value) => String(value).split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

export function normalizeSortBy(input: string | string[] | undefined): SortBy {
  const value = Array.isArray(input) ? input[0] : input;
  const normalized = String(value ?? "recientes").trim().toLowerCase();

  if (normalized === "alfabetico") {
    return "alfabetico";
  }

  if (normalized === "precio_asc") {
    return "precio_asc";
  }

  if (normalized === "precio_desc") {
    return "precio_desc";
  }

  return "recientes";
}

async function getPublicClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createServerComponentClient();
}

export async function listPublicFilters(): Promise<PublicFilterGroup[]> {
  const supabase = await getPublicClient();

  if (!supabase) {
    return [];
  }

  const { data: filters } = await supabase
    .from("filtros")
    .select("id, nombre")
    .order("nombre", { ascending: true });

  const { data: values } = await supabase
    .from("valores_filtros")
    .select("id, filtro_id, valor")
    .order("valor", { ascending: true });

  return (filters ?? []).map((filter) => ({
    id: String(filter.id),
    nombre: filter.nombre,
    valores: (values ?? [])
      .filter((value) => String(value.filtro_id) === String(filter.id))
      .map((value) => ({
        id: String(value.id),
        filtro_id: String(value.filtro_id),
        valor: String(value.valor),
      })),
  }));
}

export async function listPublicProducts(input: {
  searchQuery?: string;
  filterValues?: string[];
  sortBy?: SortBy;
  offset?: number;
  limit?: number;
}): Promise<PublicProduct[]> {
  const supabase = await getPublicClient();

  if (!supabase) {
    return [];
  }

  const { data: productos } = await supabase
    .from("productos")
    .select("id, nombre, descripcion, precio, creado_at")
    .order("creado_at", { ascending: false });

  const { data: fotografias } = await supabase
    .from("fotografias")
    .select("id, producto_id, url_imagen")
    .order("creado_at", { ascending: true });

  const { data: assignments } = await supabase
    .from("producto_valores_filtros")
    .select("producto_id, filtro_id, valor_filtro_id");

  const { data: filterValues } = await supabase
    .from("valores_filtros")
    .select("id, filtro_id, valor");

  const valueMap = new Map((filterValues ?? []).map((entry) => [String(entry.id), entry]));
  const photoMap = new Map<string, Array<{ id: string; url_imagen: string }>>();

  for (const item of fotografias ?? []) {
    const key = String(item.producto_id);
    const current = photoMap.get(key) ?? [];
    current.push({ id: String(item.id), url_imagen: String(item.url_imagen) });
    photoMap.set(key, current);
  }

  let products = (productos ?? []).map((producto) => {
    const productAssignments = (assignments ?? []).filter(
      (assignment) => String(assignment.producto_id) === String(producto.id),
    );

    return {
      id: String(producto.id),
      nombre: String(producto.nombre),
      descripcion: producto.descripcion ? String(producto.descripcion) : null,
      precio: producto.precio === null || producto.precio === undefined ? null : Number(producto.precio),
      creado_at: String(producto.creado_at),
      fotografias: photoMap.get(String(producto.id)) ?? [],
      filtros: productAssignments.map((assignment) => {
        const value = valueMap.get(String(assignment.valor_filtro_id));

        return {
          filtro_id: String(assignment.filtro_id),
          valor_filtro_id: String(assignment.valor_filtro_id),
          valor: value ? String(value.valor) : "",
        };
      }),
    } satisfies PublicProduct;
  });

  const searchTerm = input.searchQuery?.trim().toLowerCase() ?? "";
  if (searchTerm) {
    products = products.filter((product) => {
      const haystack = `${product.nombre} ${product.descripcion ?? ""}`.toLowerCase();
      return haystack.includes(searchTerm);
    });
  }

  const selectedValues = (input.filterValues ?? []).filter(Boolean);
  if (selectedValues.length > 0) {
    products = products.filter((product) => {
      const assigned = new Set(
        product.filtros.map((filter) => String(filter.valor_filtro_id)),
      );

      return selectedValues.every((valueId) => assigned.has(valueId));
    });
  }

  const sortBy = input.sortBy ?? "recientes";
  const sorted = [...products].sort((left, right) => {
    if (sortBy === "alfabetico") {
      return left.nombre.localeCompare(right.nombre) || left.creado_at.localeCompare(right.creado_at);
    }

    if (sortBy === "precio_asc") {
      const leftPrice = left.precio == null ? Number.POSITIVE_INFINITY : left.precio;
      const rightPrice = right.precio == null ? Number.POSITIVE_INFINITY : right.precio;
      return leftPrice - rightPrice || left.creado_at.localeCompare(right.creado_at);
    }

    if (sortBy === "precio_desc") {
      const leftPrice = left.precio == null ? Number.NEGATIVE_INFINITY : left.precio;
      const rightPrice = right.precio == null ? Number.NEGATIVE_INFINITY : right.precio;
      return rightPrice - leftPrice || left.creado_at.localeCompare(right.creado_at);
    }

    return new Date(right.creado_at).getTime() - new Date(left.creado_at).getTime();
  });

  const offset = Math.max(input.offset ?? 0, 0);
  const limit = input.limit ?? sorted.length;

  if (limit === Number.POSITIVE_INFINITY || limit === Number.MAX_SAFE_INTEGER) {
    return sorted.slice(offset);
  }

  return sorted.slice(offset, offset + limit);
}

export async function getPublicProductById(productId: string): Promise<PublicProduct | null> {
  const supabase = await getPublicClient();

  if (!supabase || !productId) {
    return null;
  }

  const { data: product } = await supabase
    .from("productos")
    .select("id, nombre, descripcion, precio, creado_at")
    .eq("id", productId)
    .maybeSingle();

  if (!product) {
    return null;
  }

  const { data: fotografias } = await supabase
    .from("fotografias")
    .select("id, url_imagen")
    .eq("producto_id", productId)
    .order("creado_at", { ascending: true });

  const { data: assignments } = await supabase
    .from("producto_valores_filtros")
    .select("filtro_id, valor_filtro_id")
    .eq("producto_id", productId);

  const { data: filterValues } = await supabase
    .from("valores_filtros")
    .select("id, filtro_id, valor");

  const valueMap = new Map((filterValues ?? []).map((entry) => [String(entry.id), entry]));

  return {
    id: String(product.id),
    nombre: String(product.nombre),
    descripcion: product.descripcion ? String(product.descripcion) : null,
    precio: product.precio === null || product.precio === undefined ? null : Number(product.precio),
    creado_at: String(product.creado_at),
    fotografias: (fotografias ?? []).map((item) => ({
      id: String(item.id),
      url_imagen: String(item.url_imagen),
    })),
    filtros: (assignments ?? []).map((assignment) => {
      const value = valueMap.get(String(assignment.valor_filtro_id));

      return {
        filtro_id: String(assignment.filtro_id),
        valor_filtro_id: String(assignment.valor_filtro_id),
        valor: value ? String(value.valor) : "",
      };
    }),
  };
}
