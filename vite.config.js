import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy'
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    base: './',
    publicDir: 'public/',
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        // viteStaticCopy({
        //     targets: [
        //         {
        //             src: 'resources/js/ui/**/*', // Copy all files from ui folder
        //             dest: '../ui'      // To ui folder in build output
        //         }
        //     ]
        // }),
        tailwindcss(),
    ],
    resolve: {
        alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
});
