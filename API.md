# Billing & Inventory API

Base URL: `http://localhost:3000/api` (port from `PORT` in `.env`, default `3000`)

## Contents

- [Auth](#auth)
- [Customers](#customers)
- [Product Categories](#product-categories)
- [Products](#products)
- [Product Variants](#product-variants)
- [Cart](#cart)
- [Invoices](#invoices)


## Auth

### `POST /auth/login`

The only public endpoint.

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "admin@example.com", "password": "Admin@123" }'
```

| Field | Rules |
| --- | --- |
| `email` | valid email, required |
| `password` | min 6 chars, required |

Response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "…", "name": "Admin", "email": "…", "role": "OWNER" },
    "token": {
      "access_token": "eyJ…",
      "refresh_token": "eyJ…",
      "token_expiry": "2026-08-17 19:48:51",
      "refresh_token_expiry": "2026-08-23 19:48:51"
    }
  }
}
```

> **The token is nested.** It lives at `data.token.access_token`, not `data.token`.

Save it for the rest of the session:

```bash
export TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "admin@example.com", "password": "Admin@123" }' \
  | node -pe "JSON.parse(require('fs').readFileSync(0)).data.token.access_token")
```

---

## Customers

`POST` `GET` `GET /:id` `PUT /:id` `PATCH /:id/restore` `DELETE /:id` — all at `/customers`.

### `POST /customers`

```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "name": "Ravi Kumar",
    "phone": "9876543210",
    "email": "ravi@example.com",
    "address": "12 MG Road",
    "city": "Pune",
    "state": "Maharashtra",
    "pincode": "411001",
    "gst_number": "27AAAAA0000A1Z5"
  }'
```

| Field | Rules | Required |
| --- | --- | --- |
| `name` | 2–150 chars | yes |
| `phone` | 7–20 chars, digits `+ - space` only | yes |
| `email` | valid email, max 150 | no |
| `address` | max 500 | no |
| `city` / `state` | max 100 | no |
| `pincode` | max 10 | no |
| `gst_number` | max 20 | no |
| `is_active` | boolean | no |

Optional fields accept `null` or `""` (empty string is normalized to `null`).
`phone` and `email` must be unique across customers.

### `GET /customers`

```bash
curl -G http://localhost:3000/api/customers \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "page=1" \
  --data-urlencode "limit=10" \
  --data-urlencode "search=ravi" \
  --data-urlencode "status=active"
```

Only the [common list parameters](#common-list-parameters). `search` matches name,
phone and email.

### `GET /customers/:id`

```bash
curl http://localhost:3000/api/customers/<uuid> -H "Authorization: Bearer $TOKEN"
```

### `PUT /customers/:id`

Partial update — send only what changes, but **at least one field**.

```bash
curl -X PUT http://localhost:3000/api/customers/<uuid> \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{ "city": "Mumbai" }'
```

### `DELETE /customers/:id` and `PATCH /customers/:id/restore`

```bash
curl -X DELETE http://localhost:3000/api/customers/<uuid> -H "Authorization: Bearer $TOKEN"
curl -X PATCH http://localhost:3000/api/customers/<uuid>/restore -H "Authorization: Bearer $TOKEN"
```

Soft delete — sets `is_active` to `false`. Deleting an already-deleted customer is an error.

---

## Product Categories

Same six routes at `/product-categories`.

### `POST /product-categories`

```bash
curl -X POST http://localhost:3000/api/product-categories \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{ "name": "Mobiles", "description": "Phones and accessories" }'
```

| Field | Rules | Required |
| --- | --- | --- |
| `name` | 2–100 chars | yes |
| `description` | max 2000, `null`/`""` allowed | no |
| `is_active` | boolean | no |

### `GET /product-categories`

Only the [common list parameters](#common-list-parameters). `search` matches `name`.

```bash
curl -G http://localhost:3000/api/product-categories \
  -H "Authorization: Bearer $TOKEN" --data-urlencode "search=mobile"
```

### `GET /:id` · `PUT /:id` · `PATCH /:id/restore` · `DELETE /:id`

Identical in shape to the customer routes. `PUT` needs at least one field.

---

## Products

Same six routes at `/products`. A product belongs to a category and holds the
variants that actually carry price and stock.

### `POST /products`

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "category_id": "<category-uuid>",
    "name": "iPhone 19",
    "brand": "Apple",
    "description": "Flagship"
  }'
```

| Field | Rules | Required |
| --- | --- | --- |
| `category_id` | UUID | yes |
| `name` | 2–150 chars | yes |
| `brand` | max 100, `null`/`""` allowed | no |
| `description` | max 2000, `null`/`""` allowed | no |
| `is_active` | boolean | no |

### `GET /products`

Common list parameters **plus**:

| Param | Type |
| --- | --- |
| `category_id` | UUID |

```bash
curl -G http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "category_id=<category-uuid>" \
  --data-urlencode "status=active"
```

`search` matches name and brand.

### `GET /:id` · `PUT /:id` · `PATCH /:id/restore` · `DELETE /:id`

Same shape as the customer routes.

---

## Product Variants

Same six routes at `/product-variants`. The variant is the sellable unit — it owns
the SKU, price and stock.

### `POST /product-variants`

```bash
curl -X POST http://localhost:3000/api/product-variants \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "product_id": "<product-uuid>",
    "sku": "APPLE-IPHONE-19-RED-128",
    "name": "Red / 128GB",
    "price": 5049,
    "stock_quantity": 40,
    "low_stock_threshold": 5
  }'
```

| Field | Rules | Default |
| --- | --- | --- |
| `product_id` | UUID, **required** | — |
| `sku` | max 64, letters/numbers/`.`/`-`/`_` only, **required**, unique | — |
| `name` | 1–150 chars, **required** | — |
| `price` | number 0–99999999.99, 2 decimals | `0` |
| `stock_quantity` | int ≥ 0 | `0` |
| `low_stock_threshold` | int ≥ 0 | `10` |
| `is_active` | boolean | `true` |

`sku` is upper-cased before saving and must be unique. `price` is **sent** as a
number but **returned** as `"5049.00"`.

### `GET /product-variants`

Common list parameters **plus**:

| Param | Type | Notes |
| --- | --- | --- |
| `product_id` | UUID | |
| `category_id` | UUID | filters through the parent product |
| `low_stock` | boolean | `true` → `stock_quantity <= low_stock_threshold` |

```bash
curl -G http://localhost:3000/api/product-variants \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "low_stock=true" \
  --data-urlencode "status=active"
```

`search` matches SKU and name.

### `PUT /product-variants/:id`

```bash
curl -X PUT http://localhost:3000/api/product-variants/<uuid> \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{ "price": 5499, "stock_quantity": 60 }'
```

At least one field required. Omitted fields keep their current value.

### `DELETE /:id` and `PATCH /:id/restore`

Soft delete. The row stays so billed cart rows can still resolve their variant.

---

## Cart

The cart is **implicit** — there is no cart id. "Your cart" is every row belonging to
your user where `invoice_id IS NULL` and `status = 'ACTIVE'`.

Customers are **not** attached at cart time. The customer is chosen when the invoice
is created.

### `GET /cart`

```bash
curl http://localhost:3000/api/cart -H "Authorization: Bearer $TOKEN"
```

```json
{
  "data": {
    "items": [
      {
        "id": "<cart-row-uuid>",
        "sku": "APPLE-IPHONE-19-RED-128",
        "product_name": "iPhone 19 - Red / 128GB",
        "unit_price": "5049.00",
        "quantity": 2,
        "line_total": "10098.00",
        "customer": null,
        "variant": { "…": "…", "product": { "…": "…" } }
      }
    ],
    "summary": { "item_count": 1, "total_quantity": 2, "subtotal": "10098.00" }
  }
}
```

`items[].customer` stays `null` until the invoice stamps it.

### `POST /cart/items`

```bash
curl -X POST http://localhost:3000/api/cart/items \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{ "variant_id": "<variant-uuid>", "quantity": 2 }'
```

| Field | Rules | Default |
| --- | --- | --- |
| `variant_id` | UUID, **required** | — |
| `quantity` | int ≥ 1 | `1` |

Adding the **same** variant again does not create a second row — it increments the
existing one. Rejected if the variant or its product is inactive, or if the resulting
quantity exceeds stock.

> Adding to cart does **not** reduce stock. Stock moves only when the invoice is created.

### `PUT /cart/items/:id`

```bash
curl -X PUT http://localhost:3000/api/cart/items/<cart-row-uuid> \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{ "quantity": 5 }'
```

`:id` is the **cart row id** from `items[].id`, not the variant id. `quantity` is
required and must be ≥ 1 — use `DELETE` to remove an item.

### `DELETE /cart/items/:id` and `DELETE /cart`

```bash
curl -X DELETE http://localhost:3000/api/cart/items/<cart-row-uuid> -H "Authorization: Bearer $TOKEN"
curl -X DELETE http://localhost:3000/api/cart -H "Authorization: Bearer $TOKEN"
```

The first removes one row, the second empties the cart. Both are real deletes.

---

## Invoices

Creating an invoice converts your **entire open cart** into a bill in one transaction:
the customer is validated, stock is deducted, the invoice row is written, and the cart
rows become its line items.

### `POST /invoices`

Line items are **not** sent in the body — whatever is in your open cart becomes the bill.

```bash
curl -X POST http://localhost:3000/api/invoices \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "customer_id": "<customer-uuid>",
    "discount_amount": 100,
    "tax_rate": 18,
    "payment_status": "PAID",
    "payment_method": "UPI",
    "notes": "counter sale"
  }'
```

| Field | Rules | Default |
| --- | --- | --- |
| `customer_id` | UUID, **required** | — |
| `discount_amount` | number ≥ 0, not more than the subtotal | `0` |
| `tax_rate` | number 0–100 (percent) | `0` |
| `payment_status` | `PENDING` \| `PAID` \| `PARTIAL` | `PENDING` |
| `payment_method` | `CASH` \| `CARD` \| `UPI` \| `null` | `null` |
| `notes` | max 2000, `""`/`null` allowed | `null` |

`CANCELLED` cannot be set here — cancelling has to restore stock, so it has its own
endpoint.

**Totals:**

```
subtotal     = Σ (unit_price × quantity)
taxable      = subtotal − discount_amount
tax_amount   = taxable × tax_rate / 100
total_amount = taxable + tax_amount
```

Returns `201` with the full invoice: `customer`, `creator`, and `items[]` (each with
its nested `variant` → `product`).

**Errors:**

| Message | Cause |
| --- | --- |
| `Cart is empty. Add an item before creating an invoice` | no open cart rows |
| `Customer not found` / `Customer is inactive` | bad `customer_id` |
| `discount_amount cannot be greater than the cart subtotal` | discount too large |
| `Only N unit(s) of SKU in stock` | stock dropped since the item was added |

Any failure rolls the whole transaction back — stock is not deducted and the cart
survives intact.

### `GET /invoices`

```bash
curl -G http://localhost:3000/api/invoices \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "page=1" \
  --data-urlencode "limit=10" \
  --data-urlencode "search=INV-20260816" \
  --data-urlencode "payment_status=PAID" \
  --data-urlencode "customer_id=<customer-uuid>" \
  --data-urlencode "created_by=<user-uuid>" \
  --data-urlencode "date_from=2026-08-01" \
  --data-urlencode "date_to=2026-08-16"
```

| Param | Type | Default |
| --- | --- | --- |
| `page` | int ≥ 1 | `1` |
| `limit` | int 1–100 | `10` |
| `search` | partial match on `invoice_number` | — |
| `payment_status` | `PENDING` \| `PAID` \| `PARTIAL` \| `CANCELLED` | — |
| `customer_id` | UUID | — |
| `created_by` | UUID | — |
| `date_from` / `date_to` | ISO date | — |

There is no `status` filter here — invoices have no `is_active`.

Either date bound works on its own. A date-only `date_to` covers that **whole day**,
so `date_to=2026-08-16` includes invoices created on the 16th.

The list omits `items[]` — it returns `customer` and `creator` only. Use the detail
endpoint for line items.

### `GET /invoices/:id`

```bash
curl http://localhost:3000/api/invoices/<uuid> -H "Authorization: Bearer $TOKEN"
```

Full invoice with `customer`, `creator`, and `items[]` ordered by creation, each item
carrying its nested `variant` → `product`.

### `PATCH /invoices/:id/payment`

```bash
curl -X PATCH http://localhost:3000/api/invoices/<uuid>/payment \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{ "payment_status": "PAID", "payment_method": "CASH" }'
```

| Field | Rules | Required |
| --- | --- | --- |
| `payment_status` | `PENDING` \| `PAID` \| `PARTIAL` | yes |
| `payment_method` | `CASH` \| `CARD` \| `UPI` \| `null` | no |

A cancelled invoice cannot be updated.

### `PATCH /invoices/:id/cancel`

```bash
curl -X PATCH http://localhost:3000/api/invoices/<uuid>/cancel \
  -H "Authorization: Bearer $TOKEN"
```

Returns every sold unit to stock and sets `payment_status` to `CANCELLED`.

The cart rows are **not touched** — they keep `status = 'CONVERTED'` and their
`invoice_id`, because they are the record of what was billed. Cancelled items do not
return to the cart.

**Authorization:** an `OWNER` may cancel any invoice; a `SALESMAN` may cancel only
invoices they created. Otherwise `403`:

```json
{ "success": false, "message": "You can only cancel invoices you created" }
```

Cancelling twice is an error.

### Invoice numbers

Generated as `INV-<YYYYMMDDHHmmssSSS>-<6 random chars>`, e.g.
`INV-20260816194918740-AY0N2Q`. Nothing is read from the table, so concurrent billing
cannot collide on a number. The numbers are **not** a gapless sequence.

---

## End-to-end example

```bash
# 1. token
export TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123"}' \
  | node -pe "JSON.parse(require('fs').readFileSync(0)).data.token.access_token")

# 2. pick a variant and a customer
export VARIANT=$(curl -s -G http://localhost:3000/api/product-variants \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "limit=1" --data-urlencode "status=active" \
  | node -pe "JSON.parse(require('fs').readFileSync(0)).data[0].id")

export CUSTOMER=$(curl -s -G http://localhost:3000/api/customers \
  -H "Authorization: Bearer $TOKEN" --data-urlencode "limit=1" \
  | node -pe "JSON.parse(require('fs').readFileSync(0)).data[0].id")

# 3. fill the cart
curl -s -X POST http://localhost:3000/api/cart/items \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"variant_id\":\"$VARIANT\",\"quantity\":2}"

# 4. bill it
curl -s -X POST http://localhost:3000/api/invoices \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"customer_id\":\"$CUSTOMER\",\"tax_rate\":18,\"payment_status\":\"PAID\",\"payment_method\":\"UPI\"}"
```

Each user has exactly one open cart. Once billed, those rows become `CONVERTED`, so
refill the cart before creating the next invoice — otherwise you get
`Cart is empty. Add an item before creating an invoice`.

