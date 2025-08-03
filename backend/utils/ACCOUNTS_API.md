
# Accounts API – Robo Books Backend

CRUD operations for the Chart of Accounts, modeled after Zoho Books.  
Supports hierarchical groups, opening balances, and GST metadata.

---

### Base path
```
/api/accounts
```

---

## Endpoints

| Method | Path | Roles | Purpose |
|--------|------|-------|---------|
| **GET** | `/` | admin, accountant | List accounts (filter by `category`, `parent`, `is_active`) |
| **GET** | `/:id` | admin, accountant | Fetch single account |
| **POST** | `/` | **admin** | Create a new account |
| **PUT** | `/:id` | **admin** | Update account fields (balance immutable) |
| **DELETE** | `/:id` | **admin** | Soft‑delete (`is_active=false`) <br>`?force=true` hard‑deletes if balance = 0 |

> Protected routes require  
> `Authorization: Bearer <accessToken>`

---

## Data Model

```js
{
  _id: ObjectId,
  code: "1001",                      // optional number
  name: "Cash",
  category: "asset",                // asset | liability | equity | income | expense
  subtype: "bank",                  // see subtype list below
  parent: ObjectId | null,          // grouping
  opening_balance: 50000,
  balance: 75000,                   // live running balance (readonly)
  currency: "INR",
  gst_treatment: "taxable",         // taxable | exempt | nil_rated | non_gst
  gst_rate: 0,
  is_active: true,
  description: "Main cash account",
  createdAt: Date,
  updatedAt: Date
}
```

### Valid `subtype` values
```
bank, cash, accounts_receivable, fixed_asset, inventory, other_asset,
accounts_payable, credit_card, current_liability, long_term_liability,
owner_equity, retained_earnings, sales, other_income,
cost_of_goods_sold, operating_expense, other_expense
```

---

## Examples

### 1  Create a new Bank account
```http
POST /api/accounts
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "code": "1001",
  "name": "ICICI Bank",
  "category": "asset",
  "subtype": "bank",
  "opening_balance": 150000,
  "currency": "INR"
}
```
**201 Created** → returns full account object.

---

### 2  Get all expense accounts
```http
GET /api/accounts?category=expense
Authorization: Bearer <jwt>
```

---

### 3  Soft‑delete an account
```http
DELETE /api/accounts/64dbe9… 
Authorization: Bearer <jwt>
```
**204 No Content**  
`is_active` becomes `false`; history preserved.

---

### 4  Hard‑delete an empty account
```http
DELETE /api/accounts/64dbe9…?force=true
```
*Only succeeds if `balance === 0`.*

---

## Validation Rules

| Rule | Error |
|------|-------|
| `name` & `category` required | 400 |
| `category` not in allowed list | 400 |
| Duplicate `code` or `name` (same parent) | 400 |
| Hard‑delete with non‑zero balance | 400 |

---

## Common Errors

| Code | Reason |
|------|--------|
| 400 | Bad payload, duplicate key, invalid ID |
| 401 | JWT missing / expired |
| 403 | Role not allowed (only **admin** may create/update/delete) |
| 404 | Account not found |

---

MIT © 2025 Robo Books
