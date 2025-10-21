import './bootstrap';
import Alpine from 'alpinejs';
import { setupVimeshUI } from '@vimesh/ui/dist/vui.mjs';
import tash from 'alpinejs-tash'

window.Alpine = Alpine;

Alpine.plugin(tash)

setupVimeshUI(window);

$vui.config = {
    namespace: "ui",
    importMap: {
        "*": "/ui/components/${component}.html",
        "page": "/ui/pages/${component}.html",
        "element": "/ui/elements/${component}.html"  
    },
    debug: true,
    autoImport: true,
};

Alpine.start();