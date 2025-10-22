import Alpine from 'alpinejs';
import { setupVimeshUI } from '@vimesh/ui/dist/vui.mjs';
import tash from 'alpinejs-tash';
import focus from '@alpinejs/focus';

window.Alpine = Alpine;

setupVimeshUI(window);
$vui.config = {
    namespace: "ui",
    importMap: {
        "*": "/ui/components/${component}.html",
        "icon": "/ui/icons/${component}.html",
        "page": "/ui/pages/${component}.html",
        "element": "/ui/elements/${component}.html"  
    },
    debug: true,
    autoImport: true,
};
$vui.Component = (component, el) => {
    component.prop = (name, fallback) => {
        let comp = $vui.findClosestComponent(el)
        if (!comp) return null
        return Alpine.bound(comp, `${name}`, fallback)
    };
    return component;
};

Alpine.plugin(tash);
Alpine.plugin(focus);

Alpine.start();