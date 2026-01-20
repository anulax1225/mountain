<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AllowIframeEmbedding
{
    /**
     * Handle an incoming request.
     *
     * Remove X-Frame-Options header and set permissive frame-ancestors
     * to allow embedding in iframes from any origin.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Remove X-Frame-Options header to allow iframe embedding
        $response->headers->remove('X-Frame-Options');

        // Set Content-Security-Policy to allow embedding from any origin
        $response->headers->set('Content-Security-Policy', "frame-ancestors *");

        return $response;
    }
}
