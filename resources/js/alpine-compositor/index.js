import xComponent from "./directives/x-component.js";
import xLoad from "./directives/x-load.js";
import xFormat from "./directives/x-format.js";
import xElement from "./directives/x-element.js";
import { 
    createComponentElement, 
    loadStyleSheet, 
    createStyleSheet, 
} from "./importer.js";

import { 
    registerComponent,
    hasComponent,
    setDebugMode,
    getDebugMode
} from "./registery.js";

import { 
    NamespaceRegistry,
    ComponentNamespace,
    BundledNamespace,
    CDNNamespace,
} from "./namespace.js";

// Global debug configuration
let DEBUG = false;

export function enableDebug(enable = true) {
    DEBUG = enable;
    setDebugMode(enable);
    if (enable) {
        console.log('[Alpine Components] Debug mode enabled');
    }
}

export function isDebugEnabled() {
    return DEBUG;
}

const defaultRegistry = new NamespaceRegistry();

export const Compositor = {
    registry: defaultRegistry,
    registerNamespace: (name, config) => defaultRegistry.register(name, config),
    getNamespace: (name) => defaultRegistry.get(name),
    loadComponent: (tagName) => defaultRegistry.load(tagName),
    findAndLoad: (el) => defaultRegistry.findAndLoad(el),
    preloadFromGlob: (map) => defaultRegistry.fromGlob(map),

    ComponentNamespace,
    BundledNamespace,
    CDNNamespace,
    NamespaceRegistry,
    hasComponent,
    loadStyleSheet,
    createStyleSheet,
    enableDebug,
    isDebugEnabled,
}

export function plugin(Alpine) {
    Alpine.directive('component', xComponent).before("data");
    Alpine.directive('element', xElement);
    Alpine.addRootSelector(() => `[${Alpine.prefixed('element')}]`);
    Alpine.directive('load', xLoad);
    Alpine.directive("format", xFormat);
    Alpine.magic("compositor", () => Compositor);
}