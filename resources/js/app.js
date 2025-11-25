import Alpine from './alpinejs';
import { plugin, Compositor } from './alpine-compositor';
import css from '../css/app.css?inline'
import { createRouter } from './alpine-compositor/router.js';

window.Alpine = Alpine;
Alpine.compositor = Compositor;

Alpine.plugin([plugin]);
Compositor.createStyleSheet(css);

Compositor.registerNamespace('ui', { uri: '/spa/components/' });
Compositor.registerNamespace('icon', { uri: '/spa/icons/' });
Compositor.registerNamespace('page', { uri: '/spa/pages/' });
Compositor.registerNamespace('layout', { uri: '/spa/layouts/' });
Compositor.registerNamespace('router', { uri: '/spa/router/' });

Compositor.registerNamespace('app', new Compositor.BundledNamespace({ folder: './spa/' }));
Compositor.fromGlob(import.meta.glob("./spa/*.alpine.html", {
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