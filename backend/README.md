# Fitness Tracker API (Backend Capstone )

A Node.js / Express REST API for user authentication and personal workout tracking. It uses **MongoDB** (via Mongoose) for storage and **RS512-signed JWTs**, delivered through an `httpOnly` cookie, for auth.

> The package is named `fitness-tracker` this is a **fitness / workout tracker**: users register, log in, and log workout entries (exercise, sets, reps, weight).

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Authentication Flow](#authentication-flow)
- [Environment Variables](#environment-variables)
- [Option A: Run Locally (no Docker)](#option-a-run-locally-no-docker)
- [Option B: Run with Docker](#option-b-run-with-docker)
- [API Reference & Examples](#api-reference--examples)
- [Data Models](#data-models)
- [NPM Scripts](#npm-scripts)

---

## Tech Stack

- **Runtime:** Node.js (ESM — `"type": "module"`)
- **Framework:** Express 5
- **Database:** MongoDB via Mongoose 8
- **Auth:** Passport.js (`passport-jwt`), 4096-bit RSA key pair, JWT stored in an `httpOnly` cookie, signed with `RS512`
- **Other libraries:** `pino` / `pino-pretty` (logging), `express-rate-limit`, `compression`, `cors`, `cookie-parser`, `zod`, `axios`, `lodash`
- **Dev tooling:** `nodemon`, `eslint`, `prettier`

## Project Structure

```
.
├── app.js                       # Express app: middleware, security, route mounting
├── server.js                    # Entry point: connects DB, starts HTTP server, graceful shutdown
├── Dockerfile                   # Container image for the API
├── docker-compose.yml           # App + MongoDB, wired with Docker secrets/configs
├── configs/
│   └── app_config.json          # Non-secret runtime config, mounted into the container
├── secrets/                     # Local-only secret files consumed by Docker (gitignored)
│   ├── jwt_private_key
│   ├── jwt_public_key
│   ├── db_username
│   └── db_password
├── config/
│   ├── environment.js           # Central place all resolved env/config values are read from
│   ├── secrets.js                # Loads Docker secrets (prod) or .env fallback (dev)
│   └── passport-user.js          # Passport JWT strategy (cookie extractor + verify callback)
├── controllers/
│   ├── user.js                   # registerUser, login, userProfile, logOut
│   └── workouts.js                # addWorkout, getUserWorkoutPlan
├── routes/
│   ├── user.js                    # /user/* routes
│   └── workouts.js                 # /api/v1/workouts routes
├── modules/
│   ├── users.js                     # Mongoose User schema/model
│   └── workouts.js                   # Mongoose UserWorkoutPlan schema/model
├── middleware/
│   └── authenticate.js                # isAuth (passport "jwt" strategy guard)
├── lib/
│   ├── logger.js                       # pino logger instance
│   └── utils.js                         # password hashing (PBKDF2) + JWT issuing
├── db/
│   └── connect.js                        # Mongoose connection helper
├── utils/
│   └── createKeyPair.js                   # One-off script to generate an RSA key pair for JWT signing
└── .env                                    # Local environment variables (not committed)
```

## Authentication Flow

1. **Register** (`POST /user/register`) — validates required fields and password length (≥ 8 chars), hashes the password with PBKDF2 (salted, SHA-512, 10,000 iterations), creates the user, and issues a JWT.
2. **Login** (`POST /user/login`) — looks up the user by username, validates the password hash, and issues a JWT.
3. Both register and login set the JWT in an **httpOnly cookie** named `jwt`.
4. **Protected routes** use the `isAuth` middleware (Passport JWT strategy), which extracts the token from the `jwt` cookie and verifies it against the RSA **public** key using `RS512`.
5. **Logout** (`POST /user/logout`) clears the `jwt` cookie.

JWTs are signed with a 4096-bit RSA key pair. In production, the key pair and DB credentials are supplied as **Docker secrets** (`/run/secrets/*`); in local development they fall back to values in `.env` (see `config/secrets.js`).

## Environment Variables

| Variable         | Purpose                                                  |
|-------------------|-----------------------------------------------------------|
| `PORT`            | Port the server listens on (defaults to `7000`)            |
| `NODE_ENV`        | `development` / `production`                                |
| `DATABASE_URL`    | MongoDB connection string (auto-built if not set — see below) |
| `LOG_LEVEL`       | pino log level (e.g. `info`, `debug`)                         |
| `CLIENT_URL`      | Frontend origin, used for CORS                                 |
| `HOST`            | Host the server binds/logs against                               |
| `MONGO_HOST`      | Mongo host (local dev only)                                       |
| `MONGO_PORT`      | Mongo port (local dev only)                                        |
| `MONGO_USERNAME`  | Mongo auth username (dev fallback for the `db_username` secret)     |
| `MONGO_PASSWORD`  | Mongo auth password (dev fallback for the `db_password` secret)      |
| `JWT_PRIVATE_KEY` | RSA private key PEM (dev fallback for the `jwt_private_key` secret)    |
| `JWT_PUBLIC_KEY`  | RSA public key PEM (dev fallback for the `jwt_public_key` secret)       |

In production/Docker, `jwt_private_key`, `jwt_public_key`, `db_username`, and `db_password` are read from **Docker secrets** (`/run/secrets/<name>`) instead of environment variables, and non-secret app/mongo settings are read from a JSON config file at `/run/configs/app_config` (see `configs/app_config.json`).

---

## Option A: Run Locally (no Docker)

**Prerequisites:** Node.js 20+, a running MongoDB instance (local install or a free Atlas cluster).

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Generate an RSA key pair** for signing JWTs (creates `id_rsa_pub.pem` / `id_rsa_priv.pem` in the project root):

   ```bash
   node utils/createKeyPair.js
   ```

3. **Create a `.env` file** in the project root:

   ```env
   PORT=7000
   NODE_ENV=development
   LOG_LEVEL=info
   CLIENT_URL=http://localhost:5173
   HOST=localhost

   MONGO_HOST=127.0.0.1
   MONGO_PORT=27017
   # Leave these blank if your local Mongo has no auth enabled
   MONGO_USERNAME=
   MONGO_PASSWORD=

   JWT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
   ...paste the contents of id_rsa_priv.pem here...
   -----END RSA PRIVATE KEY-----"
   JWT_PUBLIC_KEY="-----BEGIN RSA PUBLIC KEY-----
   ...paste the contents of id_rsa_pub.pem here...
   -----END RSA PUBLIC KEY-----"
   ```

   > Tip: keep the multi-line PEM values wrapped in quotes exactly as shown so `dotenv` parses the newlines correctly.

4. **Make sure MongoDB is running**, e.g.:

   ```bash
   # if you have mongod installed locally
   mongod --dbpath ./data
   ```

5. **Start the server** (auto-restarts on file changes):

   ```bash
   npm run dev
   ```

   You should see:

   ```
   👉 Generated DB URL: mongodb://127.0.0.1:27017/
   connected....
   🚀 Server running at http://localhost:7000
   ```

The API is now reachable at `http://localhost:7000`.

---

## Option B: Run with Docker

This repo includes a `Dockerfile`, a `docker-compose.yml`, a non-secret `configs/app_config.json`, and a `secrets/` folder — modeling the same Docker Swarm–style secrets/config pattern used in production (`config/secrets.js` reads from `/run/secrets/*` and `/run/configs/app_config` whenever it detects it's running inside a container).

**Prerequisites:** Docker + Docker Compose.

1. **Generate real secret files** (don't ship the sample ones long-term — they're placeholders):

   ```bash
   # RSA key pair for JWT signing
   node -e "
     const crypto = require('crypto');
     const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
       modulusLength: 4096,
       publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
       privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
     });
     require('fs').writeFileSync('secrets/jwt_private_key', privateKey);
     require('fs').writeFileSync('secrets/jwt_public_key', publicKey);
   "

   # Mongo credentials used by both the mongo and app containers
   echo -n "prince" > secrets/db_username
   echo -n "a-strong-password" > secrets/db_password
   ```

   The `secrets/` folder is gitignored — never commit real credentials.

2. **Review `configs/app_config.json`** (non-secret settings the app reads at container startup):

   ```json
   {
     "app": {
       "port": 7000,
       "nodeEnv": "production",
       "logLevel": "info",
       "client_url": "http://localhost:5173"
     },
     "mongo": {
       "host": "mongo",
       "port": 27017,
       "authSource": "admin"
     }
   }
   ```

   `host: "mongo"` matches the MongoDB service name in `docker-compose.yml` so the app container can resolve it over the Compose network.

3. **Build and start everything**:

   ```bash
   docker compose up --build
   ```

   This starts two containers:
   - `mongo` — MongoDB 7, initialized with the root user/password from the `db_username` / `db_password` secrets
   - `app` — the API, built from the `Dockerfile`, reading its JWT keys and DB credentials from the mounted secrets and its app/mongo settings from the mounted config

4. **Verify it's up**:

   ```bash
   curl http://localhost:7000/user/profile
   # {"success":false,"msg":"Unauthorized"} — expected without a valid JWT cookie
   ```

5. **Stop everything**:

   ```bash
   docker compose down          # add -v to also drop the mongo_data volume
   ```

---

## API Reference & Examples

Base URL for local/Docker runs: `http://localhost:7000`

Because auth is delivered via an `httpOnly` cookie, use `curl -c` (save cookies) and `curl -b` (send cookies) to simulate a browser session.

### `POST /user/register`

Creates a new user account and logs them in (sets the `jwt` cookie).

```bash
curl -c cookies.txt -X POST http://localhost:7000/user/register \
  -H "Content-Type: application/json" \
  -d '{
        "fullname": "Prince Azuka",
        "username": "prince71",
        "password": "supersecret123",
        "age": 27,
        "sex": "Male",
        "weight": 78
      }'
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "665f1a2b3c4d5e6f7a8b9c0d",
    "fullname": "Prince Azuka",
    "username": "prince71",
    "age": 27,
    "weight": 78,
    "sex": "Male"
  },
  "expiresIn": "1h"
}
```

### `POST /user/login`

Authenticates an existing user and sets the `jwt` cookie.

```bash
curl -c cookies.txt -X POST http://localhost:7000/user/login \
  -H "Content-Type: application/json" \
  -d '{
        "username": "prince71",
        "password": "supersecret123"
      }'
```

**Response (201):** same shape as register.

### `GET /user/profile` (protected)

Returns the logged-in user's profile. Requires the `jwt` cookie from register/login.

```bash
curl -b cookies.txt http://localhost:7000/user/profile
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "fullname": "Prince Azuka",
    "username": "prince71",
    "age": 27,
    "weight": 78,
    "sex": "Male"
  }
}
```

### `POST /user/logout`

Clears the `jwt` cookie.

```bash
curl -b cookies.txt -X POST http://localhost:7000/user/logout
```

**Response (200):**
```json
{ "success": true, "msg": "Logged out successfully" }
```

### `GET /api/v1/workouts` (protected)

Returns the logged-in user's workout plan (an empty `workouts` array if none exists yet).

```bash
curl -b cookies.txt http://localhost:7000/api/v1/workouts
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "username": "prince71",
    "workouts": []
  }
}
```

### `POST /api/v1/workouts` (protected)

Appends a new workout entry to the logged-in user's plan. Note the request body shape: `username` is not included because when the user login it automatically populates the form to the login user and a nested `form` object.

```bash
curl -b cookies.txt -X POST http://localhost:7000/api/v1/workouts \
  -H "Content-Type: application/json" \
  -d '{
        "form": {
          "exercise": "Bench Press",
          "sets": 4,
          "reps": 8,
          "weight": 60
        }
      }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0e",
    "username": "prince71",
    "workouts": [
      {
        "id": "3f2b1c4a-...",
        "date": "2026-07-23T12:00:00.000Z",
        "exercise": "Bench Press",
        "sets": 4,
        "reps": 8,
        "weight": 60
      }
    ],
    "createdAt": "2026-07-23T12:00:00.000Z",
    "updatedAt": "2026-07-23T12:00:00.000Z"
  }
}
```

> `getUserWorkoutPlan` authorizes off `req.user.username` (the cookie), but `addWorkout` currently trusts the `username` field in the request body instead of `req.user` — see [Known Issues](#known-issues).

---

## Data Models

**User** (`modules/users.js`)
- `fullname`, `username` (unique), `salt` / `hash` (password — hidden by default via `select: false`), `age`, `sex` (`Male` / `Female` / `Others`), `weight`
- Timestamps (`createdAt`, `updatedAt`)

**UserWorkoutPlan** (`modules/workouts.js`)
- `username` (unique, indexed)
- `workouts`: array of subdocuments — `id` (UUID), `date`, `exercise`, `sets`, `reps`, `weight`
- Timestamps

All data is stored in the `fitness_tracker` database (hardcoded in `db/connect.js`, regardless of the DB name in `DATABASE_URL`).

## NPM Scripts

| Script                 | Description                          |
|------------------------|---------------------------------------|
| `npm run dev`          | Start the server with `nodemon`        |
| `npm run lint`         | Run ESLint                              |
| `npm run lint:fix`     | Run ESLint with auto-fix                 |
| `npm run format`       | Format code with Prettier                 |
| `npm run format:check` | Check formatting without writing changes   |
