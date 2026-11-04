<?php

namespace App\Support;

class PublicAssetUrl
{
    public static function resolve(?string $path): ?string
    {
        $path = trim(str_replace('\\', '/', $path ?? ''), '/');

        if ($path === '' || str_contains($path, '..')) {
            return null;
        }

        $publicRoot = realpath(public_path());
        $assetPath = realpath(public_path($path));

        if (! $publicRoot || ! $assetPath || ! is_file($assetPath)
            || ! str_starts_with($assetPath, $publicRoot.DIRECTORY_SEPARATOR)) {
            return null;
        }

        return asset($path);
    }
}
