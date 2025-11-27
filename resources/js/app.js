import Alpine from './alpinejs';
import { plugin, Compositor } from './alpine-compositor';
import css from '../css/app.css?inline'
import { createRouter } from './alpine-compositor/router.js';
import anchor from "@alpinejs/anchor";
import resize from '@alpinejs/resize';

import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

window.OrbitControls = OrbitControls;
window.THREE = THREE;
window.Alpine = Alpine;
Alpine.compositor = Compositor;

//Compositor.enableDebug(true);
Alpine.plugin([plugin, anchor, resize]);
Compositor.createStyleSheet(css);

// Compositor.registerNamespace('ui', { uri: '/spa/components/' });
// Compositor.registerNamespace('icon', { uri: '/spa/icons/' });
// Compositor.registerNamespace('page', { uri: '/spa/pages/' });
// Compositor.registerNamespace('layout', { uri: '/spa/layouts/' });
// Compositor.registerNamespace('router', { uri: '/spa/router/' });

Compositor.registerNamespace('icon', { uri: '/lucide-mountain-next' });

Compositor.registerNamespace('ui', new Compositor.BundledNamespace({ folder: './ui/components/' }));
Compositor.registerNamespace('page', new Compositor.BundledNamespace({ folder: './ui/pages/' }));
Compositor.registerNamespace('layout', new Compositor.BundledNamespace({ folder: './ui/layouts/' }));
Compositor.registerNamespace('mx', new Compositor.BundledNamespace({ folder: './ui/mountain/' }));
Compositor.registerNamespace('router', new Compositor.BundledNamespace({ folder: './ui/router/' }));
Compositor.registerNamespace('owl', new Compositor.BundledNamespace({ folder: './ui/owl/' }));
Compositor.preloadFromGlob(import.meta.glob("./spa/**/*.alpine.html", {
    query: "?raw",
    eager: true,
    import: 'default',
}));

Compositor.preloadFromGlob(import.meta.glob("./ui/**/*.alpine.html", {
    query: "?raw",
    eager: true,
    import: 'default',
}));

createRouter([
    { path: '/about', component: 'page-about' },
    { path: '/welcome', component: 'page-home' },
    { path: '/', component: 'page-home' },
    { path: '', component: 'page-home' }
]);

Compositor.findAndLoad(document);

Alpine.start();