"use client";

import Image from "next/image";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

import {
  DEFAULT_WHATSAPP_PHONE,
  buildWhatsAppLink,
  buildWhatsAppMessage,
  calculateCartTotals,
  createCartItemKey,
  ensureValidCartQuantity,
  normalizeCartFilterSelection,
  type CartItem,
  type CartItemInput,
} from "@/lib/cart";

export type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  isBusy: boolean;
  statusMessage: string | null;
  itemCount: number;
  subtotal: number;
  total: number;
  addItem: (item: CartItemInput) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  validateCart: () => Promise<CartItem[]>;
  checkoutCart: (phoneNumber?: string) => Promise<string | null>;
  clearStatus: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const addItem = useCallback((item: CartItemInput) => {
    const normalizedFilters = normalizeCartFilterSelection(item.selectedFilters ?? []);
    const normalizedItem = {
      ...item,
      productId: String(item.productId ?? "").trim(),
      productName: String(item.productName ?? "Producto").trim() || "Producto",
      imageUrl: String(item.imageUrl ?? ""),
      price: item.price === null || item.price === undefined ? null : Number(item.price),
      selectedFilters: normalizedFilters,
      quantity: ensureValidCartQuantity(item.quantity ?? 1),
    };

    const itemKey = createCartItemKey(normalizedItem.productId, normalizedItem.selectedFilters);

    setItems((currentItems) => {
      const existingIndex = currentItems.findIndex((entry) => entry.id === itemKey);

      if (existingIndex >= 0) {
        return currentItems.map((entry, index) =>
          index === existingIndex
            ? { ...entry, quantity: entry.quantity + normalizedItem.quantity }
            : entry,
        );
      }

      return [...currentItems, { ...normalizedItem, id: itemKey }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    const nextQuantity = Number.isFinite(quantity) ? Math.max(0, Math.floor(quantity)) : 0;

    setItems((currentItems) => {
      if (nextQuantity <= 0) {
        return currentItems.filter((item) => item.id !== itemId);
      }

      return currentItems.map((item) =>
        item.id === itemId ? { ...item, quantity: nextQuantity } : item,
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const clearStatus = useCallback(() => {
    setStatusMessage(null);
  }, []);

  const validateCart = useCallback(async () => {
    if (items.length === 0) {
      setItems([]);
      return [];
    }

    const response = await fetch("/api/cart/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      throw new Error("No pudimos validar el carrito en este momento.");
    }

    const payload = (await response.json()) as { items?: CartItem[]; message?: string };
    const nextItems = Array.isArray(payload.items) ? payload.items : [];

    setItems(nextItems);
    return nextItems;
  }, [items]);

  const checkoutCart = useCallback(
    async (phoneNumber = DEFAULT_WHATSAPP_PHONE) => {
      setIsBusy(true);
      setStatusMessage(null);

      try {
        for (let attempt = 1; attempt <= 3; attempt += 1) {
          try {
            const validatedItems = await validateCart();

            if (validatedItems.length === 0) {
              setStatusMessage("Tu carrito está vacío.");
              return null;
            }

            const message = buildWhatsAppMessage(validatedItems);
            const url = buildWhatsAppLink(phoneNumber, message);

            if (typeof window !== "undefined") {
              window.open(url, "_blank", "noopener,noreferrer");
            }

            setItems([]);
            setStatusMessage("Pedido listo para enviarse por WhatsApp.");
            return url;
          } catch (error) {
            if (attempt < 3) {
              await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
              continue;
            }

            const details = error instanceof Error ? error.message : "No pudimos validar el carrito.";
            setStatusMessage(`${details} Podés intentarlo de nuevo o contactar al vendedor directamente.`);
            return null;
          }
        }
      } finally {
        setIsBusy(false);
      }

      return null;
    },
    [validateCart],
  );

  const totals = useMemo(() => calculateCartTotals(items), [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isOpen,
      isBusy,
      statusMessage,
      itemCount: totals.itemCount,
      subtotal: totals.subtotal,
      total: totals.total,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      validateCart,
      checkoutCart,
      clearStatus,
    }),
    [addItem, checkoutCart, clearCart, clearStatus, isBusy, isOpen, items, removeItem, statusMessage, totals, updateQuantity, validateCart],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

function CartDrawer() {
  const {
    items,
    isOpen,
    openCart,
    closeCart,
    removeItem,
    updateQuantity,
    statusMessage,
    isBusy,
    itemCount,
    total,
    checkoutCart,
  } = useCart();

  return (
    <>
      <button
        type="button"
        onClick={() => (isOpen ? closeCart() : openCart())}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600"
      >
        <span>Carrito</span>
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-950/80 px-1.5 text-[10px] text-orange-300">
          {itemCount}
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm">
          <div className="ml-auto h-full w-full max-w-md border-l border-slate-800 bg-slate-950 p-5 shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Carrito</p>
                <h2 className="mt-2 text-2xl font-black uppercase text-white">Tu pedido</h2>
              </div>
              <button
                type="button"
                onClick={() => closeCart()}
                className="rounded-full border border-slate-700 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-300 hover:text-white"
              >
                Cerrar
              </button>
            </div>

            {items.length === 0 ? (
              <div className="mt-8 rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
                <p className="text-lg font-bold uppercase tracking-[0.18em] text-orange-500">Vacío</p>
                <p className="mt-3 text-sm text-slate-300">Agregá productos para armar tu pedido.</p>
              </div>
            ) : (
              <div className="mt-5 space-y-4 overflow-y-auto pb-56">
                {items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
                    <div className="flex gap-3">
                      <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.productName}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.12em] text-slate-500">
                            Foto
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold uppercase text-white">{item.productName}</p>
                            {item.selectedFilters.length > 0 && (
                              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-slate-400">
                                {item.selectedFilters.map((filter) => filter.value).join(", ")}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-300 hover:text-red-200"
                          >
                            Quitar
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-2 py-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-6 w-6 text-lg text-slate-200"
                            >
                              −
                            </button>
                            <span className="min-w-6 text-center text-sm font-bold text-white">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-6 w-6 text-lg text-slate-200"
                            >
                              +
                            </button>
                          </div>

                          <p className="text-sm font-bold text-white">
                            {item.price === null || item.price === undefined ? "A consultar" : new Intl.NumberFormat("es-AR", {
                              style: "currency",
                              currency: "ARS",
                              maximumFractionDigits: 0,
                            }).format(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 border-t border-slate-800 bg-slate-950/95 p-5">
              <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Productos</span>
                  <span>{itemCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Total estimado</span>
                  <span className="text-lg font-black text-white">
                    {total === 0 ? "A consultar" : new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(total)}
                  </span>
                </div>
                {statusMessage && <p className="text-xs text-orange-300">{statusMessage}</p>}
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => checkoutCart()}
                  disabled={isBusy || items.length === 0}
                  className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-700"
                >
                  {isBusy ? "Validando…" : "Enviar por WhatsApp"}
                </button>
                <a
                  href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}?text=${encodeURIComponent("Hola, quiero consultar una compra directa.")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-slate-200 transition hover:border-orange-500 hover:text-white"
                >
                  Contactar vendedor
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }

  return context;
}
