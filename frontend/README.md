# RiceMart frontend showcase

This branch provides a frontend-only storefront showcase. Catalog, category, supplier, policy, order-tracking, and form-response data are local demonstration data. Cart, wishlist, and checkout interactions are for preview only; the app does not call Laravel, create real accounts or orders, process payments, or send support and quote requests.

## Run with Docker

From the repository root:

```bash
docker compose -f docker-compose.showcase.yml up --build
```

Open [http://localhost:3000](http://localhost:3000). This compose file builds and runs only the Next.js storefront; it does not start Laravel or a database.

If port 3000 is already in use, choose another host port:

```bash
SHOWCASE_PORT=3002 docker compose -f docker-compose.showcase.yml up --build -d
```

Then open [http://localhost:3002](http://localhost:3002).

Stop it with:

```bash
docker compose -f docker-compose.showcase.yml down
```

## Run locally

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
