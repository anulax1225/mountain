
import xComponent from "./directives/x-component";
import xLoad from "./directives/x-load";
import { fromFolderMap, createComponent, loadComponent, findComponentsAndLoad } from "./importer";

export default {
    loadComponent,
    findComponentsAndLoad,
    createComponent,
    fromFolderMap,
    plugin: function (Alpine) {
        // Also scan after Alpine starts (in case of dynamic content)
        Alpine.directive('component', xComponent).before("data");

        Alpine.directive('load', xLoad);
        //document.addEventListener('alpine:init', scanForComponents)
    },
}