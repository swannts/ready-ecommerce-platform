# Manual installation

The web installation wizard and web based root account setup have been removed. Install the app from the command line instead.

## Docker development setup

From the project root directory, ensure `laravel-app/.env.docker` is configured (copy from `laravel-app/.env.docker.example` if needed), then start the full stack:

```sh
docker compose up -d --build
docker compose exec backend php artisan app:install
```

Compose loads the unified configuration for `frontend` (port 3000), `backend` (port 8000), and `mysql` (port 3306). The installer runs the migrations and required default seeders, then prompts for the root administrator name, email, phone number, and password. Password input is hidden. Open <http://localhost:3000> for the RiceMart Next.js frontend and <http://localhost:8000> for the Laravel backend.

## Install without Docker

1. Copy `.env.example` to `.env` and set the application URL and database connection values.
2. Install the locked dependencies and build frontend assets:

   ```sh
   composer install
   npm ci
   npm run build
   ```

3. Generate the application key and run the interactive installer:

   ```sh
   php artisan key:generate
   php artisan app:install
   ```

Use a fresh database. The command refuses to seed a database that already has users or general settings.
