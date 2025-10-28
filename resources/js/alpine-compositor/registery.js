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

export function registerComponent(el, componentName, setupFunction = ($host, $shadow, $compositor) => ({ $host, $shadow })) {
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
    class AlpineWebComponent extends HTMLElement {
        constructor() {
            super();
            this.shadowMode = true;
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
            const template = el;
            mergeAttributes(this, el.attributes);
            const content = this.discoverSlots(this.root, template);
            this.root.innerHTML = "";
            requestAnimationFrame(() => {
                this.root.appendChild(content);
                const internalName = `component-${componentName}-${Date.now().toString().substring(9)}_${Math.random().toString(36).substring(2, 7)}`.replaceAll("-", "_");
                console.log(`[Alpine Component] Initializing new ${componentName} (${internalName})`);
                this.setAttribute('x-format', '');
                this.setAttribute('x-data', internalName);
                Alpine.data(internalName, () => setupFunction(this, this.shadow));
                requestAnimationFrame(() => {
                    console.log(`[Alpine Component] Initializing alpine for ${componentName} (${internalName})`)
                    Alpine.initTree(this);
                    console.log(`[Alpine Component] Finished setup of ${componentName} (${internalName})`);
                });
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