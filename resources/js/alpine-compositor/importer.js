import { registerComponent, registerStyleSheet } from "./registery.js";

// Internal utilities (from old importer.js)
export function getUndefinedCustomElements(el) {
    if (!el) return [];
    const allElements = el.tagName === "TEMPLATE" ? el.content.querySelectorAll('*') : el.querySelectorAll('*');
    const undefinedTags = new Set();
    
    allElements.forEach(el => {
        const tagName = el.tagName.toLowerCase();
        if (tagName.includes('-')) {
            if (!customElements.get(tagName)) {
                undefinedTags.add(tagName);
            }
        } else if (tagName === "template") {
            getUndefinedCustomElements(el).forEach(x => undefinedTags.add(x))
        }
    });
    return Array.from(undefinedTags);
}

export function createComponentElement(name, htmlContent, namespace) {
    let root = document.createElement("div");
    root.innerHTML = htmlContent;
    let template = root.querySelector("template") || root.firstElementChild;
    let script = root.querySelector("script[setup]");
    
    const fullName = namespace.length ? `${namespace}-${name}` : name;
    
    if (script) {
        registerComponent(template, fullName, script.innerHTML);
    } else {
        registerComponent(template, fullName);
    }
    
    return template;
}

export async function loadStyleSheet(url) {
    let response = await fetch(url);
    let css = await response.text();
    createStyleSheet(css);
}   

export function createStyleSheet(content) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(content);
    registerStyleSheet(sheet);
}