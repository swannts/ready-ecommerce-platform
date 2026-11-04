# Manual installation

The web installation wizard and web based root account setup have been removed. Install the app from the command line instead.

## Docker development setup

Create the Docker environment file from the development defaults, then start the services:

```sh
cp .env.docker.example .env.docker
docker compose up -d --build
docker compose exec app php artisan app:install
```

Compose loads `.env.docker` for both services. The installer runs the migrations and required default seeders, then prompts for the root administrator name, email, phone number, and password. Password input is hidden. It does not create demo users or demo orders. Open <http://localhost:8000> after the command completes.

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
