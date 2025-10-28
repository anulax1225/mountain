import Alpine from 'alpinejs';
import tash from 'alpinejs-tash';
import compositor from './alpine-compositor';
import css from '../css/app.css?inline'
import { createRouter } from './router';

window.Alpine = Alpine;
Alpine.compositor = compositor;

Alpine.plugin([compositor.plugin, tash]);

compositor.createStyleSheet(css);

// compositor.fromFolderMap(import.meta.glob("./spa/**/*.alpine.html", {
//     query: "?raw",
//     eager: true,
//     import: 'default',
// }));

createRouter("page-home", [
    { path: '/about', component: 'page-about' },
    { path: '/welcome', component: 'page-home' },
    { path: '/', component: 'page-home' },
    { path: '', component: 'page-home' }
]);

console.log("Loading document");
compositor.findComponentsAndLoad(document)

Alpine.start();