# RiceMart Management Frontend

Separate Next.js seller workspace for store dashboard metrics, catalog visibility, and order confirmation. It uses the existing Laravel seller API and role-protected Sanctum bearer tokens.

## Local development

```sh
npm ci
NEXT_PUBLIC_API_URL=http://localhost:8000/api npm run dev
```

Open `http://localhost:3001`. Sign in with an active shop account. Product creation/editing and the full administration console remain in the existing Laravel shop/admin interfaces because the current seller API does not expose those workflows to this frontend.

## Docker

The root `docker-compose.yml` starts this app at `http://localhost:3001`. Set `MANAGEMENT_NEXT_PUBLIC_API_URL` at build time when the browser should reach the API at a different address.
