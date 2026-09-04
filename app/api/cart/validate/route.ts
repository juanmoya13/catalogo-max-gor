import { NextResponse } from "next/server";

import { createCartItemKey, normalizeCartFilterSelection } from "@/lib/cart";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerComponentClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { items?: Array<Record<string, unknown>> };
    const items = Array.isArray(body?.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json({ items: [], validated: true });
    }

    if (!isSupabaseConfigured()) {
      const fallbackItems = items.map((item) => {
        const selection = normalizeCartFilterSelection(
          (Array.isArray((item as { selectedFilters?: unknown }).selectedFilters)
            ? ((item as { selectedFilters?: Array<Record<string, unknown>> }).selectedFilters ?? [])
            : []) as Array<Record<string, unknown>>,
        );

        return {
          ...(item as Record<string, unknown>),
          id: createCartItemKey(
            String((item as { productId?: string }).productId ?? ""),
            selection,
          ),
          selectedFilters: selection.map((filter) => ({ id: filter.id, value: filter.value })),
        };
      });

      return NextResponse.json({
        items: fallbackItems,
        validated: false,
        message: "Supabase no está configurado.",
      });
    }

    const supabase = await createServerComponentClient();

    if (!supabase) {
      return NextResponse.json({ items, validated: false, message: "No se pudo conectar con Supabase." });
    }

    const productIds = [...new Set(items.map((entry) => String((entry as { productId?: string }).productId ?? "")).filter(Boolean))];

    if (productIds.length === 0) {
      return NextResponse.json({ items: [], validated: true });
    }

    const { data: products, error } = await supabase
      .from("productos")
      .select("id, nombre, precio")
      .in("id", productIds);

    if (error) {
      return NextResponse.json({ items, validated: false, message: error.message });
    }

    const productsById = new Map((products ?? []).map((product) => [String(product.id), product]));

    const normalizedItems = items.flatMap((item) => {
      const id = String((item as { productId?: string }).productId ?? "");
      const product = productsById.get(id);

      if (!product) {
        return [];
      }

      const selectedFilters = normalizeCartFilterSelection(
        (Array.isArray((item as { selectedFilters?: unknown }).selectedFilters)
          ? ((item as { selectedFilters?: Array<Record<string, unknown>> }).selectedFilters ?? [])
          : []) as Array<Record<string, unknown>>,
      );

      const quantity = Number((item as { quantity?: number }).quantity ?? 1);
      const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1;
      const price = product.precio === null || product.precio === undefined ? null : Number(product.precio);
      const uniqueId = createCartItemKey(id, selectedFilters);

      return [{
        id: uniqueId,
        productId: id,
        productName: String(product.nombre ?? "Producto"),
        imageUrl: String((item as { imageUrl?: string }).imageUrl ?? ""),
        price,
        selectedFilters: selectedFilters.map((filter) => ({ id: filter.id, value: filter.value })),
        quantity: safeQuantity,
      }];
    });

    return NextResponse.json({ items: normalizedItems, validated: true, removedCount: items.length - normalizedItems.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo validar el carrito.";
    return NextResponse.json({ items: [], validated: false, message }, { status: 500 });
  }
}
