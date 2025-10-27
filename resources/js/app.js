import Alpine from 'alpinejs';
import tash from 'alpinejs-tash';
import compositor from './alpine-compositor';
import { createRouter } from './router';

window.Alpine = Alpine;

Alpine.plugin([compositor.plugin, tash]);

compositor.fromFolderMap(import.meta.glob("./spa/**/*.alpine.html", {
    query: "?raw",
    eager: true,
    import: 'default',
}));

const router = createRouter("home", [
    { path: '/about', component: 'page-about' },
    { path: '/welcome', component: 'page-home' },
    { path: '/', component: 'page-home' },
    { path: '', component: 'page-home' }
]);

compositor.findComponentsAndLoad(document);
Alpine.start();