"use client";

import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = (product) => {
    setItems((prev) => {
      // Use cartItemId (id + size) to check for existence, so different sizes of same product don't merge
      const cartId = product.cartItemId || product.id;
      const existing = prev.find((p) => (p.cartItemId || p.id) === cartId);
      if (existing) {
        return prev.map((p) =>
          (p.cartItemId || p.id) === cartId ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...product, quantity: 1, cartItemId: cartId }];
    });
  };

  const removeItem = (cartId) => {
    setItems((prev) => prev.filter((p) => (p.cartItemId || p.id) !== cartId));
  };

  const value = useMemo(() => {
    const itemCount = items.reduce((sum, p) => sum + p.quantity, 0);
    const subtotal = items.reduce(
      (sum, p) => sum + p.quantity * p.price,
      0
    );
    return { items, addItem, removeItem, itemCount, subtotal };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}

