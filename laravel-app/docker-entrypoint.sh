#!/bin/sh
set -eu

if [ ! -f .env ]; then
    cp .env.example .env
fi

# The HTTP server reads the generated .env file. Copy the Compose-provided
# connection settings into it so they match the database container.
php <<'PHP'
<?php
$path = '.env';
$contents = file_get_contents($path);

foreach (['APP_ENV', 'APP_DEBUG', 'APP_URL', 'DB_CONNECTION', 'DB_HOST', 'DB_PORT', 'DB_DATABASE', 'DB_USERNAME', 'DB_PASSWORD'] as $key) {
    $value = getenv($key);
    if ($value === false) {
        continue;
    }

    $line = $key.'="'.addcslashes($value, "\\\"").'"';
    $pattern = '/^'.preg_quote($key, '/').'=.*$/m';

    if (preg_match($pattern, $contents)) {
        $contents = preg_replace($pattern, $line, $contents, 1);
    } else {
        $contents .= "\n".$line."\n";
    }
}

file_put_contents($path, $contents);
PHP

if ! grep -q '^APP_KEY=base64:' .env; then
    php artisan key:generate --force --no-interaction
fi

exec "$@"
