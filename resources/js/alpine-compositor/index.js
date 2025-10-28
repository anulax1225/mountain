
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
    hasComponent 
} from "./registery";

export default {
    hasComponent,
    loadComponent,
    loadStyleSheet,
    findComponentsAndLoad,
    createComponent,
    createStyleSheet,
    fromFolderMap,
    plugin: function (Alpine) {
        Alpine.directive('component', xComponent).before("data");
        Alpine.directive('load', xLoad);
        //Alpine.directive("format", xFormat);
        
    },
}