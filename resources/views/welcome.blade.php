<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ config('app.name', 'Laravel') }}</title>
        
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
        @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
            @vite(['resources/css/app.css', 'resources/js/app.js'])
        @endif
    </head>
    <body x-cloak class="w-screen">

          <h1>Minimal Example</h1>

        <!-- Define component using x-component -->
        <template x-component="click-counter">
            <div x-data="{ count: 0 }">
            <button @click="count++">
                Clicked: <span x-text="count"></span> times
            </button>
            </div>
        </template>

        <!-- Use the components -->
        <h2>Components in Action:</h2>
        <click-counter></click-counter>
        <click-counter></click-counter>
    </body>
</html>
