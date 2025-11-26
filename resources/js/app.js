import Alpine from './alpinejs';
import { plugin, Compositor } from './alpine-compositor';
import css from '../css/app.css?inline'
import { createRouter } from './alpine-compositor/router.js';

window.Alpine = Alpine;
Alpine.compositor = Compositor;
Compositor.enableDebug(true);
Alpine.plugin([plugin]);
Compositor.createStyleSheet(css);

// Compositor.registerNamespace('ui', { uri: '/spa/components/' });
// Compositor.registerNamespace('icon', { uri: '/spa/icons/' });
// Compositor.registerNamespace('page', { uri: '/spa/pages/' });
// Compositor.registerNamespace('layout', { uri: '/spa/layouts/' });
// Compositor.registerNamespace('router', { uri: '/spa/router/' });

Compositor.registerNamespace('ui', new Compositor.BundledNamespace({ folder: './spa/components/' }));
Compositor.registerNamespace('icon', new Compositor.BundledNamespace({ folder: './spa/icons/' }));
Compositor.registerNamespace('page', new Compositor.BundledNamespace({ folder: './spa/pages/' }));
Compositor.registerNamespace('layout', new Compositor.BundledNamespace({ folder: './spa/layouts/' }));
Compositor.registerNamespace('router', new Compositor.BundledNamespace({ folder: './spa/router/' }));
Compositor.loadFromGlob(import.meta.glob("./spa/**/*.alpine.html", {
    query: "?raw",
    eager: true,
    import: 'default',
}))

createRouter([
    { path: '/about', component: 'page-about' },
    { path: '/welcome', component: 'page-home' },
    { path: '/', component: 'page-home' },
    { path: '', component: 'page-home' }
]);

Alpine.start();