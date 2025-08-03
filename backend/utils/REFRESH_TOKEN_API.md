
# Refresh‑Token Flow – Robo Books Backend

This document explains how the backend issues, stores, rotates, and revokes **refresh tokens** so that front‑end clients can maintain a seamless session without forcing users to re‑authenticate every 15 minutes.

---

## 🔑 Concept Recap

| Token | TTL | Where stored | Purpose |
|-------|-----|--------------|---------|
| **Access JWT** | 15 minutes | In‑memory JS (browser / app) | Sent in `Authorization: Bearer <token>` header for every API call. |
| **Refresh token** | 7 days (rotated on use) | **HttpOnly cookie** `jid` (`SameSite=Strict`) | Used **only** to obtain a fresh access JWT when the current one expires. |

---

## Endpoints

| Method | Path | Auth | What it does |
|--------|------|------|--------------|
| `POST` | `/api/auth/signup` | — | Register user & set `jid` cookie |
| `POST` | `/api/auth/login` | — | Login user & set `jid` cookie |
| `POST` | `/api/auth/refresh-token` | Cookie `jid` | **Rotates** refresh token & returns `{ "accessToken": "..." }` |
| `POST` | `/api/auth/logout` | Cookie `jid` | Deletes refresh token in DB + clears cookie |

---

## Cookie Details

| Property | Value |
|----------|-------|
| Name | `jid` |
| `httpOnly` | `true` *(JS can’t read it)* |
| `sameSite` | `strict` |
| `secure` | `true` in production (HTTPS) |
| `path` | `/api/auth/refresh-token` |

> **Why this matters:** The cookie is **only** sent to the refresh‑endpoint, never to other routes, minimizing CSRF surface.

---

## Database Table: `refresh_tokens`

| Field | Type | Notes |
|-------|------|-------|
| `user` | ObjectId → **User** | Owner |
| `token` | `uuid` (String) | Stored **as‑is** (can hash if desired) |
| `expiry` | `Date` | Auto‑clean in cron job / TTL index |
| `device_info` | `String` | User‑Agent snapshot |

TTL index example:
```js
db.refresh_tokens.createIndex({ expiry: 1 }, { expireAfterSeconds: 0 })
```

---

## Sequence Diagram

```
[ Front‑End ]        [ Express API ]         [ MongoDB ]
     |                    |                       |
1. login/signup           |                       |
     ────────────────────►|                       |
     |   set cookie jid   |                       |
     ◄────────────────────|  insert refresh_token |
     |                    |           ───────────►|
     |                    |                       |
2. call protected route   |                       |
     ────────────────────►| verify access JWT     |
     |          (401)     |                       |
     ◄────────────────────|                       |
3. /refresh-token         |                       |
     ────────────────────►| verify+rotate token   |
     |  new access JWT    |  new refresh_token    |
     ◄────────────────────| insert + delete old  ─►|
```

---

## Example: Rotation in action

```http
POST /api/auth/refresh-token
Cookie: jid=5d8a1490-ad2e-4ec4...

-- RESPONSE 200 ----------------
Set-Cookie: jid=3b5e2eaf-a406-4a7c...; HttpOnly; SameSite=Strict; Path=/api/auth/refresh-token
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```
*Old refresh token is deleted from DB; new one inserted with a fresh 7‑day expiry.*

---

## Common Error Responses

| Code | Message | Meaning |
|------|---------|---------|
| 401 | `No refresh token` | Cookie absent |
| 401 | `Invalid or expired refresh token` | Token not in DB or TTL passed |
| 500 | `...` | Unexpected server error |

---

## Good Practices

1. **Rotate on every use** – mitigates stolen cookie window.  
2. **One refresh per device** – store `device_info` for audit & selective logout.  
3. **Cron cleanup** – TTL index or daily job removes expired rows.  
4. **Secure & SameSite** – avoids XSS / CSRF leakage.  

---

MIT © 2025 Robo Books
