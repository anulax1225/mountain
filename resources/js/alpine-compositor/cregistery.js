import { addScopeToNode, prefixed } from "alpinejs";
import evaluateScriptSetup from "./evaluator.js";
import { ref, reactive, computed, effect, propsBuilder  } from "./utils.js"
import { injectMagics } from "alpinejs/src/magics";

const registeredComponents = new Set();
const componentStyleSheet = new CSSStyleSheet();
componentStyleSheet.replaceSync(`
    :host {
        display: block;
        padding: 0;
        margin: 0;
        width: auto;
        height: auto;
        box-sizing: content-box;
    }
`);
const sheets = [componentStyleSheet];

const DIR_DATA = prefixed('data')
const DIR_INIT = prefixed('init')

function getRootNode(el) {
    const template = el.tagName === 'TEMPLATE' ? el.content.cloneNode(true) : el.cloneNode(true);
    return template;
}

export function mergeAttributes(el, attributes) {
    if (el && attributes) Array.from(attributes).forEach(attr => {
        if (!el.hasAttribute(attr.name) && attr.name !== "x-component") {
            el.setAttribute(attr.name, attr.value);
        }
    });
}

export function registerStyleSheet(sheet) {
    sheets.push(sheet);
    console.log("[Alpine Styles] ✓ Registered new style sheet")
}

export function hasComponent(name) {
    registeredComponents.has(name);
}
// from https://github.com/vimeshjs/vimesh-ui - src/x-component.js
function copyAttributes(elFrom, elTo) {
    Array.from(elFrom.attributes).forEach(attr => {
        //if (DIR_COMP === attr.name || attr.name.startsWith(DIR_COMP)) return
        try {
            let name = attr.name
            if (name.startsWith('@'))
                name = `${prefixed('on')}:${name.substring(1)}`
            else if (name.startsWith(':'))
                name = `${prefixed('bind')}:${name.substring(1)}`
            if (DIR_INIT === name && elTo.getAttribute(DIR_INIT)) {
                elTo.setAttribute(name, attr.value + ';' + elTo.getAttribute(DIR_INIT))
            } else if (DIR_DATA === name) {
                return;
            } else if ('class' === name) {
                elTo.setAttribute(name, attr.value + ' ' + (elTo.getAttribute('class') || ''))
            } else if (!elTo.hasAttribute(name)) {
                elTo.setAttribute(name, attr.value)
            }
        } catch (ex) {
            console.warn(`Fails to set attribute ${attr.name}=${attr.value} in ${elTo.tagName.toLowerCase()}`)
        }
    })
}

export function registerComponent(el, componentName, setupScript) {
    if (!componentName) {
        console.error('[Alpine Component] Component name is required');
        return;
    }

    if (!componentName.includes('-')) {
        console.error(`[Alpine Component] "${componentName}" must contain a hyphen`);
        return;
    }

    if (registeredComponents.has(componentName)) {
        console.warn(`[Alpine Component] "${componentName}" already registered`);
        return;
    }

    if (customElements.get(componentName)) {
        console.warn(`[Alpine Component] "${componentName}" already exists as custom element`);
        registeredComponents.add(componentName);
        return;
    }

    const template = el.cloneNode(true);
    class AlpineWebComponent extends HTMLElement {
        constructor() {
            super();
            this.shadowMode = true;
            console.log(`Should unwrap ${template.hasAttribute("unwrap")}`)
            this.unwrap = false;
            this.shadow = this.shadowMode ? this.attachShadow({ mode: 'open' }) : null;
            if (this.shadowMode) {
                this.shadow.adoptedStyleSheets = sheets;
                this.root = this.shadow;
            } else {
                this.root = this;
            }
        }

        connectedCallback() {
            if (this.shadowMode) {
                this.shadow.innerHTML = this.innerHTML;
                this.innerHTML = "";
            }
            console.log(`[Alpine Component] Initializing new ${componentName} (${internalName})`);
            requestAnimationFrame(() => {
                console.log(`[Alpine Component] Initializing alpine for ${componentName} (${internalName})`)
                Alpine.initTree(this);
                copyAttributes(template, this);
                //const content = this.discoverSlots(this.root, template);
                this.root.innerHTML = "";
                this.root.appendChild(content);
                const props = Alpine.reactive({});
                let data = evaluateScriptSetup(
                    this, 
                    setupScript, 
                    [ this, this.shadow ], 
                    { ref, reactive, effect, computed, defineProps: propsBuilder(this, props) }
                )
                injectMagics(data);
                const componentData = Alpine.reactive(data);
                console.log(data);
                addScopeToNode(this.root, data);
                console.log(`[Alpine Component] Finished setup of ${componentName} (${internalName})`);
            });
        }

        discoverSlots(el, component) {
            const namedSlots = {};
            el.querySelectorAll("template").forEach(template => {
                if (template.hasAttribute("name") && !template.hasAttribute("x-for") && !template.hasAttribute("x-if")) {
                    const div = document.createElement('div');
                    div.appendChild(template.content.cloneNode(true));
                    namedSlots[template.getAttribute("name")] = div.innerHTML;
                }
            });
            const slots = document.createElement("div");
            slots.innerHTML = el.innerHTML;
            slots.querySelectorAll("template").forEach(template => {
                if (template.hasAttribute("name") && !template.hasAttribute("x-for") && !template.hasAttribute("x-if")) {
                    template.remove();
                }
            });
            const defaultSlot = slots.innerHTML;
            const templates = component.tagName === "TEMPLATE" ? component.content.cloneNode(true) : component.cloneNode(true);
            templates.querySelectorAll("slot").forEach(slot => {
                let slotContent;
                if (slot.hasAttribute("name")) {
                    slotContent = namedSlots[slot.getAttribute("name")] || slot.innerHTML;
                } else {
                    slotContent = defaultSlot || slot.innerHTML;
                }
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = slotContent;
                while (tempDiv.firstChild) {
                    slot.parentNode.insertBefore(tempDiv.firstChild, slot);
                }
                slot.remove();
            });

            return templates;
        }
    }
    try {
        customElements.define(componentName, AlpineWebComponent);
        registeredComponents.add(componentName);
        console.log(`[Alpine Component] ✓ Registered: ${componentName}`);
    } catch (error) {
        console.error(`[Alpine Component] Failed to register "${componentName}":`, error);
    }
}