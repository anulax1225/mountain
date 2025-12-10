import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
    ],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./tests/js/setup.js'],
        include: ['tests/js/**/*.test.js'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            include: ['resources/js/alpine-compositor/**/*.js'],
            exclude: ['**/*.test.js', '**/test-components/**']
        },
    },
    resolve: {
        alias: {
            '@compositor': '/resources/js/alpine-compositor',
            '@test-components': '/tests/js/test-components',
        }
    }
});