import { loadComponent } from "../importer";

export default (el, { expression, value }) => {
    const name = expression.trim();
    const namespace = value;
    loadComponent(namespace && namespace.length ? `${namespace}-${name}` : name);
}