const registeredComponents = new Set();

function getRootNode(el) {
    const template = el.tagName === 'TEMPLATE' ? el.content.cloneNode(true) : el.cloneNode(true);
    if (el.tagName !== 'TEMPLATE') template.removeAttribute('x-component');
    return template;
}

function mergeAttributes(el, attributes) {
    Array.from(attributes).forEach(attr => {
        if (!el.hasAttribute(attr.name) && attr.name !== "x-component") {
            el.setAttribute(attr.name, attr.value);
        }
    });
}

function registerComponent(el, componentName) {
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
    
    const template = getRootNode(el);

    // Create Web Component class
    class AlpineWebComponent extends HTMLElement {
        constructor() {
            super();
            let shadow = false;
            this.root = shadow ? this.attachShadow({ mode: 'open' }) : this;
        }

        connectedCallback() {
            const content = template.cloneNode(true);

            const rootElement = this;
            if (rootElement && el.tagName === 'TEMPLATE') mergeAttributes(rootElement, el.attributes);
            this.root.appendChild(content);
            
            requestAnimationFrame(() => {
                Alpine.initTree(this.root);
            });
        }

        disconnectedCallback() {
            if (this.shadowRoot) {
                Alpine.destroyTree(this.root);
            }
        }
    }

    // Register the custom element
    try {
        customElements.define(componentName, AlpineWebComponent);
        registeredComponents.add(componentName);
        console.log(`[Alpine Component] ✓ Registered: ${componentName}`);

        el.style.display = 'hidden';
        el.remove();
    } catch (error) {
        console.error(`[Alpine Component] Failed to register "${componentName}":`, error);
    }
}

function scanForComponents() {
    console.log('[Alpine Component] Scanning for components...');

    // Find all x-component elements
    const xComponents = document.querySelectorAll('[x-component]');
    console.log(`[Alpine Component] Found ${xComponents.length} x-component elements`);

    xComponents.forEach(el => {
        const name = el.getAttribute('x-component');
        if (name) {
            registerComponent(el, name.trim());
        }
    });
}

async function importComponent(name) {
    let response = await fetch(`/ui/components/${name}.alpine.html`);
    let html = await response.text(); 
    console.log(html);
}

export default function (Alpine) {
    importComponent('click-counter');
    // Also scan after Alpine starts (in case of dynamic content)
    Alpine.directive('component', (el, { expression }) => {
        const componentName = expression.trim();
        registerComponent(el, componentName);
    });

    // Provide magic helper for programmatic registration
    Alpine.magic('registerComponent', () => {
        return (name, element) => {
            registerComponent(element, name);
        };
    });

    document.addEventListener('alpine:init', scanForComponents)
}

// Auto-register if Alpine is global
if (typeof window !== 'undefined' && window.Alpine) {
    window.Alpine.plugin(AlpineComponentPlugin);
}