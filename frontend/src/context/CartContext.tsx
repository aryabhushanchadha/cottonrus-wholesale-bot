import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import type { Product, ProductVariant } from "../api/client";

export interface CartLine {
  variant: ProductVariant;
  product: Product;
  quantity: number;
}

interface CartContextValue {
  lines: CartLine[];
  addLine: (product: Product, variant: ProductVariant, quantity: number) => void;
  removeLine: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  subtotalMinor: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const addLine = (product: Product, variant: ProductVariant, quantity: number) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.variant.id === variant.id);
      if (existing) {
        return prev.map((l) =>
          l.variant.id === variant.id ? { ...l, quantity: l.quantity + quantity } : l
        );
      }
      return [...prev, { product, variant, quantity }];
    });
  };

  const removeLine = (variantId: string) => {
    setLines((prev) => prev.filter((l) => l.variant.id !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    setLines((prev) => prev.map((l) => (l.variant.id === variantId ? { ...l, quantity } : l)));
  };

  const clear = () => setLines([]);

  const subtotalMinor = useMemo(
    () => lines.reduce((sum, l) => sum + l.variant.priceMinor * l.quantity, 0),
    [lines]
  );

  return (
    <CartContext.Provider value={{ lines, addLine, removeLine, updateQuantity, clear, subtotalMinor }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
