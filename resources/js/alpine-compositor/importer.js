import { registerComponent } from "./registery";
import evaluateScriptSetup from "./evaluator";

const appType = "spa";

const namespaces = {
    ui: { folder: `./${appType}/components/`, uri: `/${appType}/components/` },
    icon: { folder: `./${appType}/icons/`, uri: `/${appType}/icons/` },
    page: { folder: `./${appType}/pages/`, uri: `/${appType}/pages/` },
    layout: { folder: `./${appType}/layouts/`, uri: `/${appType}/layouts/` },
    router: { folder: `./${appType}/router/`, uri: `/${appType}/router/` },
    app: { folder: `./${appType}/`, uri: `/${appType}/` },
};

export function getUndefinedCustomElements(el) {
    const allElements = el.tagName === "TEMPLATE" ? el.content.querySelectorAll('*') : el.querySelectorAll('*');
    const undefinedTags = new Set();
    allElements.forEach(el => {
        const tagName = el.tagName.toLowerCase();
        if (tagName.includes('-')) {
            if (!customElements.get(tagName)) {
                undefinedTags.add(tagName);
            }
        }
    });
    return Array.from(undefinedTags);
}

export function createComponent(name, component, namespace) {
    let root = document.createElement("div");
    root.innerHTML = component;
    let template = root.querySelector("template") || root.firstElementChild;
    let script = root.querySelector("script[setup]");
    if (script) {
        const setupFunction = evaluateScriptSetup(script.innerHTML);
        registerComponent(template, namespace.length ? `${namespace}-${name}` : name, setupFunction);
        return template;
    }
    registerComponent(template, namespace.length ? `${namespace}-${name}` : name);
    return template;
}

export function fromFolderMap(map) {
    Object.entries(map).forEach(([path, content]) => {
        const name = path.split('/').pop().replace('.alpine.html', '');
        const namespace = Object.entries(namespaces).find(
            ([ namespace, { folder } ]) => path.startsWith(folder)
        )[0] || "";
        createComponent(name, content, namespace);
    }, {});
}

export async function findComponentsAndLoad(el) {
    let undefines = getUndefinedCustomElements(el);
    let promises = undefines.map(subComponent => loadComponent(subComponent));
    await Promise.all(promises);
}

export async function loadComponent(name) {
    let nameComponents = name.split("-");
    const namespace = nameComponents.reverse().pop();
    const componentName = nameComponents.reverse().slice(0, nameComponents.length).reduce((prev, current) => prev + "-" + current);
    let response = await fetch(`${namespaces[namespace].uri}${componentName}.alpine.html`);
    let html = await response.text();
    let template = createComponent(componentName, html, namespace);
    await findComponentsAndLoad(template);
}   