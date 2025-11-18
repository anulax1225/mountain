import { registerComponent, registerStyleSheet } from "./cregistery";

const appType = "spa";

const autoImport = true;

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
        registerComponent(template, namespace.length ? `${namespace}-${name}` : name, script.innerHTML);
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
    console.log(`[Alpine Component] Looking up the element (${el.tagName ? el.tagName : el.firstElementChild.tagName}) for unimported components`);
    let undefines = getUndefinedCustomElements(el);
    console.log(`[Alpine Component] Found ${undefines.length} components (${undefines}) now waiting for import`);
    requestAnimationFrame(async () => {
        let promises = undefines.map(subComponent => {
            return loadComponent(subComponent);
        });
        await Promise.all(promises);
    })

}

export async function loadComponent(name) {
    let nameComponents = name.split("-");
    const namespace = nameComponents.reverse().pop();
    const componentName = nameComponents.reverse().slice(0, nameComponents.length).reduce((prev, current) => prev + "-" + current);
    let response = await fetch(`${namespaces[namespace].uri}${componentName}.alpine.html`);
    let html = await response.text();
    let template = createComponent(componentName, html, namespace);
    if (autoImport) await findComponentsAndLoad(template);
}  

export async function loadStyleSheet(url) {
    console.log("[Alpine Styles] Loading style sheet from " + url);
    let response = await fetch(url);
    let css = await response.text();
    createStyleSheet(css);
}   

export function createStyleSheet(content) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(content);
    registerStyleSheet(sheet);
}