export type CartFilterSelection = {
  id: string;
  value: string;
};

export type CartItem = {
  id: string;
  productId: string;
  productName: string;
  imageUrl: string;
  price: number | null;
  selectedFilters: CartFilterSelection[];
  quantity: number;
};

export type CartItemInput = {
  productId: string;
  productName: string;
  imageUrl?: string;
  price?: number | null;
  selectedFilters?: CartFilterSelection[];
  quantity?: number;
};

export function normalizeCartFilterSelection(
  filters: Array<Partial<CartFilterSelection> | null | undefined> = [],
): CartFilterSelection[] {
  const seen = new Set<string>();

  return [...filters]
    .map((filter) => ({
      id: String(filter?.id ?? "").trim(),
      value: String(filter?.value ?? "").trim(),
    }))
    .filter((filter) => filter.id && filter.value)
    .filter((filter) => {
      const compositeKey = `${filter.id}:${filter.value}`;

      if (seen.has(compositeKey)) {
        return false;
      }

      seen.add(compositeKey);
      return true;
    })
    .sort((left, right) => left.id.localeCompare(right.id) || left.value.localeCompare(right.value));
}

export function createCartItemKey(productId: string, selectedFilters: CartFilterSelection[] = []): string {
  const normalizedFilters = normalizeCartFilterSelection(selectedFilters);
  const signature = normalizedFilters.length
    ? normalizedFilters.map((filter) => `${filter.id}:${filter.value}`).join("|")
    : "default";

  return `${String(productId).trim()}|${signature}`;
}

export function ensureValidCartQuantity(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.floor(value));
}

export function calculateCartTotals(items: CartItem[]) {
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => {
    if (item.price === null || item.price === undefined) {
      return total;
    }

    return total + item.price * item.quantity;
  }, 0);

  return {
    itemCount,
    subtotal,
    total: subtotal,
    hasPricedItems: subtotal > 0,
  };
}

export function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) {
    return "A consultar";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function buildWhatsAppMessage(items: CartItem[]): string {
  const safeItems = items.filter((item) => item.quantity > 0);

  if (safeItems.length === 0) {
    return "Hola, quiero consultar mi pedido.";
  }

  const lines = safeItems.map((item, index) => {
    const selector = item.selectedFilters.length > 0 ? ` (${item.selectedFilters.map((filter) => filter.value).join(", ")})` : "";
    const priceLine = item.price === null || item.price === undefined
      ? "precio a consultar"
      : `${formatCurrency(item.price * item.quantity)}`;

    return `${index + 1}. ${item.productName}${selector} x${item.quantity} — ${priceLine}`;
  });

  const total = safeItems.reduce((sum, item) => {
    if (item.price === null || item.price === undefined) {
      return sum;
    }

    return sum + item.price * item.quantity;
  }, 0);

  const totalText = safeItems.some((item) => item.price !== null && item.price !== undefined)
    ? `Total estimado: ${formatCurrency(total)}`
    : "Total estimado: A consultar";

  return [
    "Hola, quiero hacer este pedido:",
    ...lines,
    "",
    totalText,
    "",
    "Gracias.",
  ].join("\n");
}

export function buildWhatsAppLink(phoneNumber: string, message: string): string {
  const normalizedPhone = String(phoneNumber ?? "").trim();

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

export function createCartItemFromProduct(
  product: {
    id: string;
    nombre?: string;
    name?: string;
    precio?: number | null;
    price?: number | null;
    fotografias?: Array<{ url_imagen?: string | null }>;
    filtros?: Array<{ valor_filtro_id?: string; valor?: string; filtro_id?: string; filtro_nombre?: string }>;
  },
  quantity = 1,
): CartItem {
  const productName = String(product?.nombre ?? product?.name ?? "Producto").trim() || "Producto";
  const price = product?.precio ?? product?.price ?? null;
  const imageUrl = product?.fotografias?.[0]?.url_imagen ?? "";
  const selectedFilters = normalizeCartFilterSelection(
    (product?.filtros ?? []).map((filter) => ({
      id: String(filter?.valor_filtro_id ?? filter?.filtro_id ?? ""),
      value: String(filter?.valor ?? filter?.filtro_nombre ?? "Selección"),
    })),
  );
  const normalizedQuantity = ensureValidCartQuantity(quantity);

  return {
    id: createCartItemKey(String(product?.id ?? ""), selectedFilters),
    productId: String(product?.id ?? ""),
    productName,
    imageUrl,
    price: price === null || price === undefined ? null : Number(price),
    selectedFilters,
    quantity: normalizedQuantity,
  };
}

export const DEFAULT_WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE as string;
