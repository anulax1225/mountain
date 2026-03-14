<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}"  @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Apple PWA --}}
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="{{ config('app.name', 'Owlaround') }}">

        {{-- Theme color (light + dark) --}}
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
        <meta name="theme-color" content="#231f2b" media="(prefers-color-scheme: dark)">

        <title inertia>{{ config('app.name', 'Owlaround') }}</title>

        <link rel="icon" href="/owl-logo.png" sizes="any">
        <!-- <link rel="icon" href="/favicon.svg" type="image/svg+xml"> -->
        <link rel="apple-touch-icon" href="/owl-logo.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600|inter:400,500,600|nunito:400,500,600|poppins:400,500,600|dm-sans:400,500,600" rel="stylesheet" />

        @vite(['resources/js/app.ts', "resources/js/pages/{$page['component']}.vue"])
        @inertiaHead
    </head>
    <body class="antialiased">
        @csrf
        @inertia
    </body>
</html>
