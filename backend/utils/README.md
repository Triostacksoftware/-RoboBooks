
# Robo Books Backend API  
> **Express + MongoDB** service that powers a Zoho Books‑style accounting platform.  
> Modules implemented so far: **Authentication · Chart of Accounts · Journal Entries · Banking**

---

## ✨ Key Features
| Area | Highlights |
|------|------------|
| **Authentication** | • Email + password JWT flow<br>• Google OAuth 2.0<br>• HttpOnly *refresh-token* cookie (`jid`) with rotation<br>• Role‑based access (*admin*, *accountant*, *user*) |
| **Accounts** | CRUD for chart‑of‑accounts with live running balance |
| **Journals** | Balanced debit/credit journal entries that auto‑update account balances inside a Mongo transaction |
| **Banking** | Deposit / withdrawal entries, reconciliation flag, automatic balance updates |
| **Security** | Helmet, CORS, bcrypt, SameSite=Strict cookies |
| **Testing‑ready** | Jest & Supertest setup |

---

## 🗄️ Tech Stack
- **Runtime**  Node 18 + Express 4  
- **DB**  MongoDB 6 (Mongoose 8)  
- **Auth**  JWT (`jsonwebtoken`) & OAuth (`passport-google-oauth20`)  
- **Misc**  dotenv, helmet, cors, morgan, bcryptjs, uuid

---

## 🚀 Quick Start

```bash
git clone <repo>
cd robo-books-backend

cp .env.example .env  # fill secrets
npm install
npm run dev           # nodemon auto‑reloads
```

Server: **`http://localhost:4000`** — hit `/api/health` for heartbeat.

---

## ⚙️ .env Reference
| Var | Example | Description |
|-----|---------|-------------|
| PORT | 4000 | (optional) |
| MONGO_URI | mongodb://localhost:27017/robobooks | |
| ACCESS_TOKEN_SECRET | change_me | Access‑JWT secret |
| REFRESH_TOKEN_SECRET | change_me_too | Refresh‑JWT secret |
| GOOGLE_CLIENT_ID | … | OAuth |
| GOOGLE_CLIENT_SECRET | … | OAuth |
| OAUTH_CALLBACK_URL | http://localhost:4000/api/auth/google/callback | |
| CLIENT_ORIGIN | http://localhost:3000 | CORS allow‑origin |
| COOKIE_DOMAIN | localhost | Domain for cookies |

---

## 🔑 Auth Flow
1. **Signup / Login** → tokens + `jid` cookie  
2. **JWT header** `Authorization: Bearer <access>`  
3. **Refresh** `/api/auth/refresh-token` (cookie auto‑sent)  
4. **Google OAuth** `/api/auth/google`

Access tokens last 15 min; refresh tokens last 7 days.

---

## 📚 Endpoint Cheat‑Sheet

### Auth
`POST /api/auth/signup` · `POST /login` · `POST /logout` · `POST /refresh-token`  
`GET /google` · `GET /google/callback`

### Accounts (admin, accountant)
`GET /api/accounts` · `POST` · `PUT /:id` · `DELETE /:id`

### Journal Entries (admin, accountant)
`GET /api/journal-entries` · `POST`

### Bank Transactions (admin, accountant)
`GET /api/bank-transactions` · `POST` · `PATCH /:id/reconcile`

### Misc
`GET /api/health`

---

## 📂 Structure
```
config/   controllers/   middleware/
models/   routes/        services/
tests/    server.js      README.md
```

---

MIT © 2025 Robo Books
