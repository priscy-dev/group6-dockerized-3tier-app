# Stage 1: Local three-tier deployment

This stage proves that the application works before AWS infrastructure is introduced.

## What runs locally

`frontend` is an Nginx container that serves the built React application on port `8080`.
It forwards `/user/*` and `/api/*` internally to `backend`; the browser never needs the
backend container's port.

`backend` is the Node/Express API. It is private to the Docker network and connects to
`mongo` using MongoDB authentication.

The backend writes JSON logs to its standard output. This is intentional: Docker captures
them locally and AWS CloudWatch will capture the same logs in production.

`mongo` is the database. Its port is intentionally not published to the host. The named
Docker volume `mongo_data` preserves data when containers restart.

## First-time setup

1. Install and start Docker Desktop. Confirm `docker version` and `docker compose version`
   both work in PowerShell.
2. From the repository root, generate local-only development secrets:

   ```powershell
   node scripts/initialize-local-secrets.mjs
   ```

   This creates the MongoDB password and RSA JWT key pair in `backend/secrets/`. That
   folder is ignored by Git and must never be committed.
3. Build and start all three services:

   ```powershell
   docker compose up --build -d
   ```
4. Check that all services are healthy:

   ```powershell
   docker compose ps
   docker compose logs --follow backend
   ```
5. Open http://localhost:8080. Create an account with a password of at least eight
   characters. The frontend calls `POST /user/register`; Nginx forwards it to the API;
   the API saves the user in MongoDB and returns an httpOnly login cookie.

   Local Docker Compose runs with `NODE_ENV=development`, because HTTP on localhost
   cannot use Secure cookies. The AWS deployment will set `NODE_ENV=production` only
   when the Application Load Balancer is serving HTTPS.

## Verification

From PowerShell, the backend health endpoint should respond through the frontend proxy:

```powershell
Invoke-WebRequest http://localhost:8080/health
```

Do not expect ports `7000` or `27017` to be reachable from the host. They are deliberately
private to the Docker network, just as they will be private in AWS.

## Stop or reset

```powershell
docker compose down
```

This stops containers but keeps registered users in the `mongo_data` volume. To delete all
local test data deliberately, use `docker compose down -v`.
