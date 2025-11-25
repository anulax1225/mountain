import { Compositor } from "../index.js"

export default (el, { expression, value }) => {
    const name = expression.trim();
    const namespace = value;
    Compositor.loadComponent(namespace && namespace.length ? `${namespace}-${name}` : name);
}