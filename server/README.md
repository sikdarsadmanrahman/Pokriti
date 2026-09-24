# Organic Store API (Node · Express · MongoDB)

## Run
```bash
cp .env.example .env        # fill in MONGODB_URI, JWT_SECRET, Cloudinary keys, merchant numbers
npm install
npm run seed                # builds indexes, creates categories + first admin
npm run dev
```

## Public API (no auth)
| Method | Path | Notes |
|---|---|---|
| GET | `/api/config` | shipping rates, payment methods + merchant numbers, support contacts |
| GET | `/api/categories` | active categories |
| GET | `/api/products` | `?page&limit&category=<slug>&combo=true&featured=true&inStock=true&q&sort=newest\|popular` |
| GET | `/api/products/flash-sale` | live sale products + `endsAt` for the countdown bar |
| GET | `/api/products/:slug` | product detail (combo contents populated) |
| POST | `/api/orders` | checkout: ids + quantities only, server prices everything |
| POST | `/api/orders/track` | `{ orderId, phone }` |

## Admin API (`Authorization: Bearer <token>`)
| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/login` · GET `/api/auth/me` | |
| GET | `/api/admin/dashboard` | today/30-day sales, orders by status, stock alerts |
| POST/DELETE | `/api/admin/uploads/images` | multipart `images` (≤5) → Cloudinary WebP |
| GET/POST | `/api/admin/categories` · PUT/DELETE `/:id` | |
| GET/POST | `/api/admin/products` · GET/PUT/DELETE `/:id` | `?status&category&q&stock=low\|out` |
| PATCH | `/api/admin/products/:id/stock` | `{variantId, stock}` or `{variantId, delta}` |
| PATCH | `/api/admin/products/:id/status` | `{status:'archived'\|'active'}` |
| GET | `/api/admin/orders` | `?status&paymentStatus&paymentMethod&orderId&phone&from&to&page&limit` |
| GET | `/api/admin/orders/:id` · `/:id/invoice` · `/invoices?ids=a,b` | invoice = JSON for a print layout |
| PATCH | `/api/admin/orders/:id/status` | forward-only pipeline; Cancelled restocks |
| PATCH | `/api/admin/orders/:id/payment` | verify / fail a mobile-banking TrxID |
| GET/PATCH | `/api/admin/customers` · `/:id` · `/:id/orders` | |

Response envelope: `{ success, data, pagination? }` · errors: `{ success:false, message, details? }`
