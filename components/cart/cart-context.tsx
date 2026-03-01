"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import type { Cart, CartItem, Product } from "lib/types";

const STORAGE_KEY = "ecommerce-cart";

function computeTotals(
  items: CartItem[],
): Pick<Cart, "totalQuantity" | "totalAmount"> {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + parseFloat(item.price.amount) * item.quantity,
    0,
  );
  const currencyCode = items[0]?.price.currencyCode ?? "USD";
  return {
    totalQuantity,
    totalAmount: { amount: totalAmount.toFixed(2), currencyCode },
  };
}

function cartFromItems(items: CartItem[]): Cart {
  return { items, ...computeTotals(items) };
}

type Action =
  | { type: "ADD_ITEM"; product: Product }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "LOAD"; items: CartItem[] }
  | { type: "CLEAR" };

function reducer(cart: Cart, action: Action): Cart {
  switch (action.type) {
    case "LOAD":
      return cartFromItems(action.items);
    case "CLEAR":
      return cartFromItems([]);
    case "ADD_ITEM": {
      const existing = cart.items.find((i) => i.productId === action.product.id);
      const newItem: CartItem = {
        productId: action.product.id,
        slug: action.product.slug,
        title: action.product.title,
        price: action.product.price,
        image: action.product.featuredImage,
        quantity: 1,
      };
      const newItems = existing
        ? cart.items.map((i) =>
            i.productId === action.product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          )
        : [...cart.items, newItem];
      return cartFromItems(newItems);
    }
    case "REMOVE_ITEM":
      return cartFromItems(
        cart.items.filter((i) => i.productId !== action.productId),
      );
    case "UPDATE_QUANTITY": {
      const newItems =
        action.quantity <= 0
          ? cart.items.filter((i) => i.productId !== action.productId)
          : cart.items.map((i) =>
              i.productId === action.productId
                ? { ...i, quantity: action.quantity }
                : i,
            );
      return cartFromItems(newItems);
    }
    default:
      return cart;
  }
}

type CartContextValue = Cart & {
  addToCart: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const emptyCart: Cart = {
  items: [],
  totalQuantity: 0,
  totalAmount: { amount: "0.00", currencyCode: "USD" },
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(reducer, emptyCart);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "LOAD", items: JSON.parse(raw) });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart.items));
    } catch {
      // ignore
    }
  }, [cart.items]);

  return (
    <CartContext.Provider
      value={{
        ...cart,
        addToCart: (product) => dispatch({ type: "ADD_ITEM", product }),
        removeItem: (productId) => dispatch({ type: "REMOVE_ITEM", productId }),
        updateQuantity: (productId, quantity) =>
          dispatch({ type: "UPDATE_QUANTITY", productId, quantity }),
        clearCart: () => dispatch({ type: "CLEAR" }),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
