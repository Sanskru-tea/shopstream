# ShopStream — A Live Product Showcase & Cart Platform

Full-stack MERN e-commerce showcase built for the Main Flow Full-Stack Web Development
Internship (Project 1). The backend is implemented exactly as specified in the project
PDF; the frontend is a new React + Vite application built to consume it.

```
shopstream/
├── client/          React + Vite frontend
└── server/          Node.js + Express + MongoDB backend
```

---

## 1. Prerequisites

- Node.js 18+ and npm
- A MongoDB database (local or MongoDB Atlas)
- A free Cloudinary account (for product image uploads)
- Postman (optional, for API testing)

---

## 2. Backend setup (`server/`)

### Install

```bash
cd server
npm install
```

### Environment variables

Copy `.env.example` to `.env` and fill in your own values:

```bash
cp .env.example .env
```

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_random_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### MongoDB setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and allow network access from your IP (or `0.0.0.0/0` for
   development).
3. Copy the connection string into `MONGO_URI` in `.env`, replacing `<password>` with
   your database user's password.

### Cloudinary setup

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier is enough).
2. From your Cloudinary dashboard, copy **Cloud name**, **API Key**, and **API Secret**
   into the matching `.env` variables.
3. The `POST /api/products` route uses `multer` to receive the uploaded file locally
   (into `server/uploads/`, temporary storage) and then pushes it to Cloudinary via
   `cloudinary.uploader.upload(req.file.path)`, storing the returned `secure_url` on
   the product.

### JWT setup

`JWT_SECRET` can be any long random string (e.g. generate one with
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`). Tokens are
signed with `jsonwebtoken` and expire after 30 days (`expiresIn: '30d'`), exactly as in
the PDF.

### Run

```bash
npm start
```

This runs `nodemon server.js`, so the server restarts automatically on file changes. You
should see `MongoDB connected` and `Server running on port 5000` in the console.

### Creating your first admin user

The `/api/auth/register` route always creates users with `role: 'customer'` by default
(per the PDF schema). To create an admin for testing the dashboard, register a normal
user, then manually update their role in MongoDB:

```js
// In MongoDB Compass, Atlas UI, or mongosh
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

Log out and log back in afterwards so the frontend picks up the updated role.

---

## 3. Frontend setup (`client/`)

### Install

```bash
cd client
npm install
```

### Environment variables (optional)

By default the app calls `http://localhost:5000/api`. To point elsewhere, create a
`.env` file in `client/`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Run

```bash
npm run dev
```

Open http://localhost:5173

---

## 4. Required npm packages

**Backend:** `express`, `mongoose`, `dotenv`, `bcryptjs`, `jsonwebtoken`, `cors`,
`multer`, `cloudinary`, `nodemon` (dev).

> Note: `mongoose` is pinned to `^6.x` rather than the latest major version. The PDF's
> delete route uses `product.remove()`, an instance method that Mongoose removed in
> version 7. Using `^6.x` keeps the exact given backend code working without altering
> any route logic.

**Frontend:** `react`, `react-dom`, `react-router-dom`, `axios`, `vite`,
`@vitejs/plugin-react` (dev).

---

## 5. API endpoints (as defined in the PDF — unchanged)

| Method | Endpoint                  | Auth        | Description                       |
|--------|----------------------------|-------------|------------------------------------|
| POST   | `/api/auth/register`       | Public      | Create a user, returns JWT         |
| POST   | `/api/auth/login`          | Public      | Log in, returns JWT                |
| GET    | `/api/products`            | Public      | List all products                  |
| GET    | `/api/products/:id`        | Public      | Get one product                    |
| POST   | `/api/products`            | Admin       | Create product (multipart + image) |
| PUT    | `/api/products/:id`        | Admin       | Update product (name & price only) |
| DELETE | `/api/products/:id`        | Admin       | Delete product                     |
| GET    | `/api/cart`                | Logged in   | Get current user's cart            |
| POST   | `/api/cart`                | Logged in   | Add item / increment quantity      |
| DELETE | `/api/cart/:productId`     | Logged in   | Remove item from cart              |

**Known backend limitation (kept intentionally, per your "don't change backend logic"
instruction):** `PUT /api/products/:id` only persists `name` and `price` — the route's
own code only updates those two fields before saving. The admin edit form still sends
the full object, but description/category/stock/image edits won't be saved unless you
extend that route yourself later.

There's also no dedicated "decrease quantity" cart endpoint — only add (increments) and
delete (removes entirely). The frontend's cart page recreates a decrement by calling
delete + add-at-new-quantity under the hood, without adding any new backend routes.

---

## 6. Postman API testing steps

1. **Register:**
   `POST http://localhost:5000/api/products` → wait, start with auth:
   `POST http://localhost:5000/api/auth/register`
   Body (JSON): `{ "name": "Jane", "email": "jane@example.com", "password": "pass1234" }`
   → copy the `token` from the response.

2. **Login:**
   `POST http://localhost:5000/api/auth/login`
   Body (JSON): `{ "email": "jane@example.com", "password": "pass1234" }`

3. **Create a product (admin only):**
   `POST http://localhost:5000/api/products`
   Headers: `Authorization: Bearer <admin_token>`
   Body: `form-data` with fields `name`, `description`, `price`, `category`, `stock`,
   and `image` (type: File).

4. **List products:**
   `GET http://localhost:5000/api/products` (no auth needed)

5. **Add to cart:**
   `POST http://localhost:5000/api/cart`
   Headers: `Authorization: Bearer <token>`
   Body (JSON): `{ "productId": "<id from step 4>", "quantity": 2 }`

6. **View cart:**
   `GET http://localhost:5000/api/cart` with the same `Authorization` header.

7. **Remove from cart:**
   `DELETE http://localhost:5000/api/cart/<productId>`

8. **Update / delete product (admin):**
   `PUT` or `DELETE` `http://localhost:5000/api/products/<id>` with the admin token.

---

## 7. Deployment

### Backend → Render

1. Push the `server/` folder to a GitHub repo (or the whole `shopstream/` monorepo).
2. On [Render](https://render.com), create a **New Web Service** from that repo.
3. Set **Root Directory** to `server` (if using a monorepo).
4. Build command: `npm install`. Start command: `npm start`.
5. Add all `.env` variables (`MONGO_URI`, `JWT_SECRET`, Cloudinary keys, `PORT`) under
   Render's **Environment** tab.
6. Deploy, then copy the resulting URL (e.g. `https://shopstream-api.onrender.com`).

### Frontend → Netlify

1. Push `client/` to GitHub (or use the monorepo with **Base directory** set to
   `client`).
2. On [Netlify](https://netlify.com), create a **New site from Git**.
3. Build command: `npm run build`. Publish directory: `dist`.
4. Add an environment variable `VITE_API_URL` pointing to your Render backend, e.g.
   `https://shopstream-api.onrender.com/api`.
5. Deploy. Netlify will give you a live URL for the storefront.
6. Back on Render, make sure CORS is happy — the PDF's `server.js` uses `app.use(cors())`
   with no origin restriction, so this should work out of the box.

---

## 8. Common errors & fixes

- **Network Error / CORS** — confirm the backend is running and `VITE_API_URL` matches
  its address.
- **401 Not authorized, no token** — you're calling a protected route without being
  logged in, or the token expired; log in again.
- **403 Admin access required** — the logged-in user's `role` isn't `admin`; update it
  in MongoDB as shown above.
- **"Cannot read properties of undefined (reading 'path')" on product create** — no
  image file was attached to the multipart request; the PDF's route always expects
  `req.file` to exist.
- **Product edits not sticking (except name/price)** — expected; see the backend
  limitation note above.
- **Blank product images** — the app falls back to a placeholder photo if `image` is
  empty or fails to load.
