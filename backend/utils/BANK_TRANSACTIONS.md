
# Bank Transactions API – Robo Books Backend  
Everything you need to **create, list and reconcile deposit/withdrawal entries** and keep account balances in-sync.

---

### Base path  
```
/api/bank-transactions
```

---

### Endpoints

| Method | Path | Auth Roles | Purpose |
|--------|------|-----------|---------|
| **GET** | `/` | `admin`, `accountant` | List transactions. Use `?reconciled=true` to filter. |
| **POST** | `/` | `admin`, `accountant` | Create a *deposit* or *withdrawal* & auto-update the linked account balance. |
| **PATCH** | `/:id/reconcile` | `admin`, `accountant` | Mark a single transaction as reconciled (sets `reconciled: true`). |

> **Headers required** for protected routes  
> `Authorization: Bearer <accessToken>`

---

### Data Model (snapshot)

```js
{
  _id: ObjectId,
  account: ObjectId,        // ref Account
  type: "deposit" | "withdrawal",
  amount: Number,           // positive
  currency: "INR",          // default
  txn_date: Date,
  reference: String,
  reconciled: Boolean,
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

### Examples

#### 1  Create a deposit
```http
POST /api/bank-transactions
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "account": "64ce1fb4c5e34e8e53e2a2c",
  "type": "deposit",
  "amount": 25000,
  "currency": "INR",
  "description": "Client payment"
}
```
**201 Created**
```json
{
  "_id": "64d045…",
  "account": "64ce1fc…",
  "type": "deposit",
  "amount": 25000,
  "currency": "INR",
  "txn_date": "2025-08-03T10:12:10.456Z",
  "reconciled": false,
  "description": "Client payment",
  "createdAt": "2025-08-03T10:12:10.457Z",
  "updatedAt": "2025-08-03T10:12:10.457Z",
  "__v": 0
}
```
*The associated account’s balance is increased by ₹25,000 inside the same Mongo transaction.*

---

#### 2  List unreconciled withdrawals only
```http
GET /api/bank-transactions?reconciled=false&type=withdrawal
Authorization: Bearer <jwt>
```

---

#### 3  Reconcile a transaction
```http
PATCH /api/bank-transactions/64d045…/reconcile
Authorization: Bearer <jwt>
```
**200 OK**
```json
{
  "_id": "64d045…",
  "reconciled": true,
  …
}
```

---

### Validation Rules
| Rule | Error |
|------|-------|
| `amount` must be > 0 | `400` |
| `type` must be `deposit` or `withdrawal` | `400` |
| `account` must exist & be an *asset* account | `400` “Linked account not found” |

---

### Common Errors

| Code | Reason |
|------|--------|
| **400** | Bad payload (missing fields, bad enum, invalid ObjectId). |
| **401** | JWT missing/expired. |
| **403** | User authenticated but lacks `admin` or `accountant` role. |
| **404** | Transaction id not found (reconcile endpoint). |

---

### Quick Integration Checklist

1. **Obtain an access token** via `/api/auth/login` (or OAuth).  
2. **Create transactions** as bookkeeping events occur.  
3. Run a **daily reconciliation** job (or manual UI) that PATCHes unreconciled entries once confirmed on bank statement.  
4. Pull **reports** by querying with `?reconciled=true/false` as needed.

---

MIT © 2025 Robo Books
