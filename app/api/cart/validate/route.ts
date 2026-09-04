import { NextResponse } from "next/server";

import { reconcileCartItemsWithCatalog } from "@/lib/cart";
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
      return NextResponse.json({
        items: items.map((item) => ({
          ...item,
          productId: String((item as { productId?: string }).productId ?? ""),
          price: (item as { price?: number | null }).price ?? null,
          quantity: Number((item as { quantity?: number }).quantity ?? 1) || 1,
        })),
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

    const normalizedItems = reconcileCartItemsWithCatalog(
      items as Array<
        { productId?: string; productName?: string; imageUrl?: string; price?: number | null; selectedFilters?: Array<Record<string, unknown>>; quantity?: number }
      >,
      (products ?? []).map((product) => ({
        id: String(product.id),
        nombre: String(product.nombre ?? "Producto"),
        precio: product.precio === null || product.precio === undefined ? null : Number(product.precio),
      })),
    );

    return NextResponse.json({ items: normalizedItems, validated: true, removedCount: items.length - normalizedItems.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo validar el carrito.";
    return NextResponse.json({ items: [], validated: false, message }, { status: 500 });
  }
}
