import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'organic-store-cart-v1';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function persist(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable (private mode) - cart just won't survive a refresh */
  }
}

const findLine = (items, productId, variantId) => items.find((l) => l.productId === productId && l.variantId === variantId);

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: load(), isOpen: false },
  reducers: {
    addItem: {
      reducer(state, action) {
        const { productId, variantId, name, image, variantLabel, price, maxQuantity, quantity } = action.payload;
        const line = findLine(state.items, productId, variantId);
        if (line) {
          line.quantity = Math.min(line.quantity + quantity, maxQuantity ?? Infinity);
        } else {
          state.items.push({ productId, variantId, name, image, variantLabel, price, maxQuantity, quantity });
        }
        state.isOpen = true;
        persist(state.items);
      },
      prepare(payload) {
        return { payload: { quantity: 1, ...payload } };
      },
    },
    updateQuantity(state, action) {
      const { productId, variantId, quantity } = action.payload;
      const line = findLine(state.items, productId, variantId);
      if (!line) return;
      if (quantity <= 0) {
        state.items = state.items.filter((l) => l !== line);
      } else {
        line.quantity = Math.min(quantity, line.maxQuantity ?? Infinity);
      }
      persist(state.items);
    },
    removeItem(state, action) {
      const { productId, variantId } = action.payload;
      state.items = state.items.filter((l) => !(l.productId === productId && l.variantId === variantId));
      persist(state.items);
    },
    clearCart(state) {
      state.items = [];
      persist(state.items);
    },
    openCart(state) {
      state.isOpen = true;
    },
    closeCart(state) {
      state.isOpen = false;
    },
    toggleCart(state) {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { addItem, updateQuantity, removeItem, clearCart, openCart, closeCart, toggleCart } = cartSlice.actions;
export default cartSlice.reducer;

export const selectCartItems = (state) => state.cart.items;
export const selectCartIsOpen = (state) => state.cart.isOpen;
export const selectCartCount = (state) => state.cart.items.reduce((n, l) => n + l.quantity, 0);
export const selectCartSubtotal = (state) => state.cart.items.reduce((sum, l) => sum + l.price * l.quantity, 0);
