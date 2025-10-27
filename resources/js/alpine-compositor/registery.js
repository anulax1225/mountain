const registeredComponents = new Set();


function getRootNode(el, parent = null) {
    const template = el.tagName === 'TEMPLATE' ? el.content.cloneNode(true) : el.cloneNode(true);
    if (el.tagName === 'TEMPLATE' && parent) mergeAttributes(parent, el.attributes);
    return template;
}

export function mergeAttributes(el, attributes) {
    if (el && attributes) Array.from(attributes).forEach(attr => {
        if (!el.hasAttribute(attr.name) && attr.name !== "x-component") {
            el.setAttribute(attr.name, attr.value);
        }
    });
}

export function registerComponent(el, componentName, setupFunction = ($host) => ({$host})) {
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
            this.shadowMode = false;
            this.unwrap = false;
            this.root = this.shadowMode ? this.attachShadow({ mode: 'open' }) : this;
        }

        connectedCallback() {
            const content = getRootNode(template, this.root);
            const slots = this.root.cloneNode(true);
            this.discoverSlots(slots, content);
            this.root.appendChild(content);
            const internalName = `comp-${componentName}-${Date.now()}_${Math.random().toString(36).substring(2, 9)}`.replaceAll("-", "_");
            Alpine.data(internalName, () => setupFunction(this.root));
            this.root.setAttribute('x-data', internalName);
            
            requestAnimationFrame(() => {
                if(!this.unwrap) Alpine.initTree(this.root);
            });
        }

        disconnectedCallback() {
            if(!this.unwrap) Alpine.destroyTree(this.root);
        }

        discoverSlots(slots, templates) {
            const namedSlots = {};
            slots.querySelectorAll("template").forEach(template => {
                if (template.hasAttribute("name") && !template.hasAttribute("x-for") && !template.hasAttribute("x-if")) {
                    namedSlots[template.getAttribute("name")] = template.innerHTML;
                    template.remove();
                }   
            });
            const defaultSlot = slots.innerHTML;
            templates.querySelectorAll("slot").forEach(slot => {
                if (slot.hasAttribute("name")) slot.innerHTML = namedSlots[slot.getAttribute("name")];
                else slot.innerHTML = defaultSlot;
                slot.childNodes.forEach(child => slot.parentNode.insertBefore(child.cloneNode(true), slot))
                slot.remove();
            });
            this.root.innerHTML = "";
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