"use client";

import { useSyncExternalStore } from "react";
import { productBySlug } from "./data";

/**
 * Tiny localStorage-backed store: survives reloads, syncs across tabs, and lets each component subscribe to
 * just the slice it needs (so a product card re-renders only when *its* quantity / wishlist state changes).
 */
function createStore(key) {
  const EVENT = `${key}:change`;
  const EMPTY = {};
  let cache = null;
  const read = () => {
    if (cache) return cache;
    try {
      cache = JSON.parse(localStorage.getItem(key)) || EMPTY;
    } catch {
      cache = EMPTY;
    }
    return cache;
  };
  const write = (next) => {
    cache = next;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
    window.dispatchEvent(new Event(EVENT));
  };
  const subscribe = (cb) => {
    const onStorage = (e) => e.key === key && ((cache = null), cb());
    window.addEventListener(EVENT, cb);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT, cb);
      window.removeEventListener("storage", onStorage);
    };
  };
  /** Subscribe to the whole object, or to one derived value via `select`. */
  const use = (select = (s) => s, fallback = EMPTY) => useSyncExternalStore(subscribe, () => select(read()), () => fallback);
  return { read, write, use };
}

const MAX_QTY = 10;
const cartStore = createStore("store_cart_v1"); // { [slug]: qty }
const wishStore = createStore("store_wishlist_v1"); // { [slug]: true }

export const cart = {
  setQty(slug, qty) {
    const { [slug]: _, ...rest } = cartStore.read();
    cartStore.write(qty > 0 ? { ...rest, [slug]: Math.min(MAX_QTY, qty) } : rest);
  },
  add: (slug) => cart.setQty(slug, (cartStore.read()[slug] || 0) + 1),
  remove: (slug) => cart.setQty(slug, 0),
  clear: () => cartStore.write({}),
  MAX_QTY,
};

export const wishlist = {
  toggle(slug) {
    const { [slug]: had, ...rest } = wishStore.read();
    wishStore.write(had ? rest : { ...rest, [slug]: true });
    return !had;
  },
};

/** Quantity of one product (cards subscribe to this, not the whole cart). */
export const useCartQty = (slug) => cartStore.use((s) => s[slug] || 0, 0);
/** Total items in the cart (header badge) — re-renders only when the total changes. */
export const useCartCount = () => cartStore.use((s) => Object.values(s).reduce((n, q) => n + q, 0), 0);
/** Whether one product is wishlisted. */
export const useWished = (slug) => wishStore.use((s) => Boolean(s[slug]), false);

/** Full cart for the drawer: { items: [{ product, qty }], count, subtotal, mrpTotal }. */
export function useCart() {
  const raw = cartStore.use();
  const items = Object.entries(raw)
    .map(([slug, qty]) => ({ product: productBySlug(slug), qty }))
    .filter((i) => i.product && i.qty > 0);
  return {
    items,
    count: items.reduce((s, i) => s + i.qty, 0),
    subtotal: items.reduce((s, i) => s + i.qty * i.product.price, 0),
    mrpTotal: items.reduce((s, i) => s + i.qty * i.product.mrp, 0),
  };
}

/** Open the cart drawer from anywhere. */
export const CART_OPEN_EVENT = "store-cart:open";
export const openCart = () => window.dispatchEvent(new Event(CART_OPEN_EVENT));
