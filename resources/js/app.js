import Alpine from 'alpinejs';
import tash from 'alpinejs-tash';
import compositor from './alpine-compositor';

window.Alpine = Alpine;

Alpine.plugin([compositor.plugin, tash]);

compositor.fromFolderMap(import.meta.glob("./spa/**/*.alpine.html", {
    query: "?raw",
    eager: true,
    import: 'default',
}))

compositor.findComponentsAndLoad(document);
Alpine.start();