import { registerComponent } from "../registery.js";
import { Compositor } from "../index.js";

export default (el, { expression, value }) => {
    if (el.tagName !== "TEMPLATE") console.error("x-component should is a directive for templates");
    const name = expression.trim();
    const namespace = value; //? value : expression.split("-")[0];
    console.log(namespace, name);
    el.removeAttribute('x-component');
    const script = el.content.querySelector("script[setup]");
    if (script) script.remove();
    registerComponent(el, namespace && namespace.length ? `${namespace}-${name}` : name, script ? script.innerHTML : 'return {}');
}