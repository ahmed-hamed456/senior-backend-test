# Fekra Solutions Hub — Marketplace Backend Documentation

## Overview

A modular, event-driven marketplace backend built with **Node.js + Express.js** (ESM). No database — all state lives in memory. Covers three challenge requirements: order flow, JWT authentication with RBAC, and in-memory caching.

---

## How to Run

```bash
npm install
npm start
# Server starts on http://localhost:3000
```

---

## Project Structure

```
src/
├── server.js                   # Entry point — registers handlers and starts HTTP server
├── app.js                      # Express app setup (routes, middleware)
├── config/
│   └── index.js                # JWT secret, cache TTL, mock user list
├── utils/
│   ├── logger.js               # Structured JSON logger (all logs go through here)
│   └── retry.js                # Generic async retry(fn, attempts, delayMs)
├── store/
│   ├── orderStore.js           # In-memory Map of orders
│   ├── cacheStore.js           # In-memory TTL cache (60s default)
│   └── idempotencyStore.js     # In-memory Set — prevents duplicate event processing
├── events/
│   ├── eventBus.js             # Thin wrapper around Node's EventEmitter
│   └── handlers/
│       ├── loggerHandler.js    # Logs every named event to console
│       ├── paymentHandler.js   # Handles "order.created" → payment flow
│       ├── stockHandler.js     # Handles "payment.success" → stock flow
│       └── deliveryHandler.js  # Handles "stock.updated" → delivery flow
├── services/
│   ├── orderService.js         # Creates order, publishes "order.created"
│   ├── paymentService.js       # Simulates payment (70% success rate)
│   ├── stockService.js         # Simulates stock check (80% success rate)
│   └── deliveryService.js      # Simulates delivery scheduling (always succeeds)
├── middleware/
│   ├── requestLogger.js        # Logs every incoming HTTP request
│   ├── authenticate.js         # Verifies JWT Bearer token → 401 if invalid
│   ├── authorize.js            # Role-based access control → 403 if role not allowed
│   ├── validate.js             # Validates POST /orders request body → 400 if invalid
│   └── errorHandler.js         # Global Express error handler
└── routes/
    ├── authRoutes.js           # POST /auth/login
    └── orderRoutes.js          # POST /orders, GET /orders, GET /orders/:id
```

---

## Event-Driven Flow

When a customer places an order, the following event chain runs automatically in the background:

```
POST /orders
     │
     ▼
orderService.createOrder()
     │  publishes
     ▼
[order.created]
     │
     ▼
paymentHandler  ──── retries up to 3 times ────►  success → publishes [payment.success]
                                                   failure → status = PAYMENT_FAILED
                                                             cache invalidated
                                                             publishes [payment.failed]
                                                   
[payment.success]
     │
     ▼
stockHandler ──────────────────────────────────►  success → publishes [stock.updated]
                                                   failure → status = STOCK_FAILED
                                                             cache invalidated
                                                             publishes [stock.failed]

[stock.updated]
     │
     ▼
deliveryHandler ───────────────────────────────►  status = COMPLETED
                                                   cache invalidated
                                                   publishes [delivery.scheduled]
```

Every event is also intercepted by `loggerHandler`, which prints:
```
[EVENT] order.created - OrderID: ord_abc123
{"level":"info","event":"order.created","orderId":"ord_abc123","timestamp":"..."}
```

---

## Key Implementations

### Retry Logic
`paymentHandler` wraps the payment call in `retry(fn, 3, 300ms)` — meaning 3 total attempts (2 retries) with 300ms between each. Each failed attempt is logged before the next try.

### Idempotency
Every handler checks a shared `idempotencyStore` before processing. The key format is `"<eventName>:<orderId>"`. If already seen, the event is skipped and logged as a duplicate. This prevents double-processing if the same event is emitted more than once.

### Caching (GET /orders/:id)
- TTL: **60 seconds**
- On first request: reads from `orderStore`, stores result in `cacheStore`, logs `Cache miss`
- On subsequent requests within 60s: returns from `cacheStore`, logs `Cache hit`
- Cache is **invalidated** whenever order status changes:
  - `paymentHandler` → invalidates on `PAYMENT_FAILED`
  - `stockHandler` → invalidates on `STOCK_FAILED`
  - `deliveryHandler` → invalidates on `COMPLETED`

---

## API Reference

### POST /auth/login
Returns a signed JWT for the given user.

**Request:**
```json
{
  "username": "customer_john",
  "password": "customer123"
}
```

**Response 200:**
```json
{
  "token": "<jwt>",
  "user": { "id": "user_customer_001", "username": "customer_john", "role": "customer" }
}
```

---

### POST /orders
Creates a new order. **Customer role only.**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "customerId": "user_customer_001",
  "items": [
    { "productId": "acme-widget-001", "quantity": 2 }
  ]
}
```

**Response 201:**
```json
{
  "success": true,
  "order": {
    "id": "ord_...",
    "customerId": "user_customer_001",
    "items": [...],
    "status": "PENDING",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

> The order status will update asynchronously in the background as the event chain runs.

**Possible final statuses:** `COMPLETED` | `PAYMENT_FAILED` | `STOCK_FAILED`

---

### GET /orders
Returns a list of orders. **Admin and Brand roles only.**

**Headers:**
```
Authorization: Bearer <token>
```

**Ownership rules:**
- `admin` → sees all orders
- `brand` → sees only orders where at least one `productId` starts with their `brandId` (e.g. `acme`)

**Response 200:**
```json
{
  "success": true,
  "count": 1,
  "orders": [...]
}
```

---

### GET /orders/:id
Returns a single order by ID. **All roles**, with ownership enforced.

**Headers:**
```
Authorization: Bearer <token>
```

**Ownership rules:**
- `admin` → any order
- `customer` → only if `order.customerId === user.id`
- `brand` → only if at least one item's `productId` starts with `user.brandId`

**Response 200:**
```json
{
  "success": true,
  "cached": false,
  "order": { ... }
}
```

`cached: true` means the response was served from the in-memory cache.

---

## Error Responses

All errors return a consistent JSON shape:

```json
{
  "error": true,
  "message": "Description of what went wrong",
  "code": 400
}
```

| Status | Cause |
|--------|-------|
| 400 | Invalid request body (missing fields, wrong types) |
| 401 | Missing, malformed, or expired JWT |
| 403 | Valid token but insufficient role or not the order owner |
| 404 | Order ID not found |
| 500 | Unexpected server error |

---

## Mock Users (pre-seeded)

| Role | Username | Password | Notes |
|------|----------|----------|-------|
| customer | `customer_john` | `customer123` | Can create and view own orders |
| admin | `admin` | `admin123` | Can view all orders |
| brand | `brand_acme` | `brand123` | Can view orders containing `acme*` products |

---

## Logging Format

Every log line is structured JSON printed to stdout:

```json
{ "level": "info", "message": "Order created", "orderId": "ord_...", "timestamp": "2026-04-10T14:24:50.839Z" }
{ "level": "error", "message": "Payment failed after all retries", "orderId": "ord_...", "error": "Payment declined", "timestamp": "..." }
```

Request logs:
```json
{ "level": "info", "message": "Incoming request", "method": "POST", "path": "/orders", "timestamp": "..." }
```

Event logs also print a plain-text line for quick scanning:
```
[EVENT] payment.success - OrderID: ord_...
```
