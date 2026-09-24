# Organic Store Client (React · Tailwind · Redux Toolkit / RTK Query)

## Run
```bash
cp .env.example .env      # leave VITE_API_BASE_URL blank to use the dev proxy (see vite.config.js)
npm install
npm run dev                # http://localhost:5173, proxies /api to VITE_API_PROXY (default http://localhost:5000)
```

## Structure
- `src/api/` — RTK Query slices (`publicApi.js` storefront, `adminApi.js` admin+auth). The shared `apiSlice.js`
  base query unwraps the backend's `{ success, data }` envelope and attaches the admin JWT automatically.
- `src/app/` — Redux store, `cartSlice` (persisted to localStorage), `authSlice` (admin JWT).
- `src/components/layout` — Header (search, categories, cart icon), Footer, sticky `FlashSaleBar`, `WhatsAppWidget`.
- `src/components/product` — `ProductCard` (variant selector + quick add), `ProductGrid`, `CategoryFilter`, `ComboSection`.
- `src/components/cart` — slide-over `CartDrawer`.
- `src/components/checkout` — shipping zone / payment method pickers, `MobileBankingFields` (bKash/Nagad/Rocket + TrxID).
- `src/components/admin` — `AdminLayout` sidebar, `ImageUploader` (Cloudinary), `VariantEditor`, `InvoiceView` (print layout).
- `src/pages` — storefront pages; `src/pages/admin` — dashboard, product/category/order/customer CRUD.

## Notes
- Cart state and totals are for display only — the backend re-prices everything and computes shipping from the
  chosen zone at checkout, so a tampered client request can't change what's charged.
- Admin routes are guarded by `RequireAuth`; the JWT is stored in `localStorage` (see `authSlice.js`).
- `npm run build` outputs a static `dist/` you can serve behind Nginx or any static host, pointed at the API via `VITE_API_BASE_URL`.
