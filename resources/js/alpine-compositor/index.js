import xComponent from "./directives/x-component";
import xLoad from "./directives/x-load";
import xFormat from "./directives/x-format";
import { 
    fromFolderMap,
    createComponent, 
    loadComponent, 
    findComponentsAndLoad, 
    loadStyleSheet, 
    createStyleSheet, 
} from "./importer";

import { 
    registerComponent,
    hasComponent,
    setDebugMode,
    getDebugMode
} from "./cregistery";
import xRoot from "./directives/x-root";

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

export default {
    hasComponent,
    loadComponent,
    loadStyleSheet,
    findComponentsAndLoad,
    createComponent,
    createStyleSheet,
    fromFolderMap,
    enableDebug,
    isDebugEnabled,
    plugin: function (Alpine) {
        Alpine.directive('component', xComponent).before("data");
        Alpine.directive('root', xRoot);
        Alpine.addRootSelector(() => `[${Alpine.prefixed('root')}]`);
        Alpine.directive('load', xLoad);
        //Alpine.directive("format", xFormat);
    },
}