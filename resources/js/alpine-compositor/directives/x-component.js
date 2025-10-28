import { registerComponent } from "../registery";

export default (el, { expression, value }) => {
    const name = expression.trim();
    const namespace = value;
    el.removeAttribute('x-component');
    registerComponent(el, namespace && namespace.length ? `${namespace}-${name}` : name);
    el.style.display = "none";
}