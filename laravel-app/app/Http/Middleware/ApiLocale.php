<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = strtolower(substr((string) $request->header('Accept-Language', 'en'), 0, 2));
        $locale = in_array($locale, ['en', 'bn'], true) ? $locale : 'en';
        app()->setLocale($locale);
        $request->attributes->set('api_locale', $locale);

        $response = $next($request);
        $response->headers->set('Content-Language', $locale);
        $response->headers->set('Vary', 'Accept-Language');
        return $response;
    }
}
