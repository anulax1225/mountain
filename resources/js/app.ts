import '../css/app.css';

import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import type { DefineComponent } from 'vue';
import { createApp, h } from 'vue';
import { useTheme } from './composables/useTheme';
import { configure } from './owl-sdk';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

configure({
    baseURL: import.meta.env.VITE_OWL_API_BASE_URL || 'https://owlaround.anulax.ch',
});
// Initialize theme before app
const { initTheme } = useTheme();
initTheme();

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.vue`, import.meta.glob<DefineComponent>('./pages/**/*.vue')),
    setup({ el, App, props, plugin }) {
        createApp({ render: () => h(App, props) })
            .use(plugin)
            .mount(el);
    },
    progress: {
        color: '#4B5563',
    },
});