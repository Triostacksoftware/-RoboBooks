# Robo Books Auth API

**Tech stack:** Express | MongoDB (Mongoose) | JSON Web Tokens | Google OAuth

This micro‑service provides registration, login (email / phone + password), Google OAuth, session cookies and a simple `/me` probe for the Robo Books platform. Front‑end (Next.js) talks to it via REST over port **5000**.

---

## 🚀 Quick start

```bash
# clone / open repo
cd backend

# install deps
npm install

# copy env template and fill secrets
cp .env.example .env

# run (nodemon hot‑reload in dev)
PORT=5000 npm run dev
# → 🔑 Auth API running on http://localhost:5000
```

Front‑end must be served from the `FRONTEND_URL` you set in `.env` (e.g. `http://localhost:3000`). Every `fetch()` call has to include `credentials: "include"` so the `rb_session` cookie is sent.

---

## ⚙️ Environment variables (`backend/.env`)

| Key                | Example                           | Description                 |
| ------------------ | --------------------------------- | --------------------------- |
| `PORT`             | `5000`                            | Port the API listens on     |
| `FRONTEND_URL`     | `http://localhost:3000`           | Allowed CORS origin         |
| `MONGODB_URI`      | `mongodb://localhost:27017`       | Mongo connection string     |
| `MONGODB_DB`       | `robobooks`                       | Database name               |
| `JWT_SECRET`       | *long‑random‑string*              | Used to sign session tokens |
| `GOOGLE_CLIENT_ID` | `xxxx.apps.googleusercontent.com` | Your OAuth 2 client id      |

---

## 📖 REST Reference

> **Base URL:** `http://localhost:5000`

All endpoints accept / return JSON and, except `GET /me`, expect a body with `Content‑Type: application/json`.

Session is kept in an **http‑only cookie**: `rb_session` (7‑day TTL).

### Status codes

* **200 / 201** – success
* **400** – bad request / missing params
* **401** – not authenticated / bad credentials / expired token
* **409** – duplicate
* **5xx** – server errors

---

### 1. Register

`POST /api/auth/register`

| Field      | Type   | Required | Notes                  |
| ---------- | ------ | -------- | ---------------------- |
| `email`    | string | ✓\*      | Lower‑case, unique     |
| `phone`    | string | ✓\*      | E.164 (`+91…`)         |
| `password` | string | optional | Omit for password‑less |

\* At least one of **email** or **phone** is required.

<details>
<summary>Sample request</summary>

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "secret123"
}
```

```json
201 Created
Set-Cookie: rb_session=…; HttpOnly; Path=/; Max-Age=604800
{
  "user": { "id": "665e…", "email": "alice@example.com", "phone": null }
}
```

</details>

---

### 2. Login (email / phone)

`POST /api/auth/login`

| Field          | Type   | Required |
| -------------- | ------ | -------- |
| `emailOrPhone` | string | ✓        |
| `password`     | string | ✓        |

Returns same payload / cookie as register.

---

### 3. Google OAuth login

`POST /api/auth/login/google`

| Field     | Type   | Required                                   |
| --------- | ------ | ------------------------------------------ |
| `idToken` | string | ✓ (received from Google Identity Services) |

Creates or links a user and issues the session cookie.

---

### 4. Current session probe

`GET /api/auth/me`

Requires `rb_session` cookie.

```json
{
  "user": { "id": "665e…", "email": "alice@example.com", "phone": null }
}
```

---

### 5. Logout

`POST /api/auth/logout`

Clears the cookie.

```json
{ "message": "Logged out" }
```

---

## 🛠  Error samples

| Case            | Response                                |
| --------------- | --------------------------------------- |
| Duplicate email | `409 {"message":"User already exists"}` |
| Wrong password  | `401 {"message":"Invalid credentials"}` |
| Missing cookie  | `401 {"message":"Unauthenticated"}`     |

---

## 🧩 Integration tips

* Always call the API with `credentials: "include"`.
* If you proxy via Next rewrites, you can keep paths as `/api/auth/...` on the client.
* Production cookies are sent with `Secure` + `SameSite=strict`.

---

© 2025 Robo Books
