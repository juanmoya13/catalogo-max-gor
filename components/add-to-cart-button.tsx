"use client";

import { useCart } from "@/components/cart-provider";
import { createCartItemFromProduct } from "@/lib/cart";
import { toast } from 'sonner';

export function AddToCartButton({
  product,
  label = "Agregar al carrito",
  className,
}: {
  product: {
    id: string;
    nombre?: string;
    name?: string;
    precio?: number | null;
    price?: number | null;
    fotografias?: Array<{ url_imagen?: string | null }>;
    filtros?: Array<{ valor_filtro_id?: string; valor?: string; filtro_id?: string; filtro_nombre?: string }>;
  };
  label?: string;
  className?: string;
}) {
  const { addItem, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={() => {
        addItem(createCartItemFromProduct(product, 1));
        toast.success(`¡Se agregó ${product.nombre} al carrito!`, {
          description: "Puedes ver tus productos en la esquina inferior derecha.",
          duration: 3000, // 3 segundos
        });
      }}
      className={className}
    >
      {label}
    </button>
  );
}
