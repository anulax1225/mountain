import evaluateScriptSetup from "./evaluator.js";
import Alpine from "../alpinejs";
import { ref, reactive, computed, effect, propsBuilder  } from "./utils.js"

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

// from https://github.com/vimeshjs/vimesh-ui - src/x-component.js
function copyAttributes(elFrom, elTo) {
    const DIR_DATA = Alpine.prefixed('data');
    const DIR_INIT = Alpine.prefixed('init');
    Array.from(elFrom.attributes).forEach(attr => {
        //if (DIR_COMP === attr.name || attr.name.startsWith(DIR_COMP)) return
        try {
            let name = attr.name
            if (name.startsWith('@'))
                name = `${Alpine.prefixed('on')}:${name.substring(1)}`
            else if (name.startsWith(':'))
                name = `${Alpine.prefixed('bind')}:${name.substring(1)}`
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

export function registerComponent(el, componentName, setupScript = "return {}") {
    console.log("[Alpine Global] New component in registration " + componentName)
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
            console.log(`[Alpine Component] ${componentName} should unwrap ${el.hasAttribute("unwrap")}`)
            this.unwrap = false;
            this.shadow = this.shadowMode ? this.attachShadow({ mode: 'open' }) : null;
            const { component, slots } = this.processComponent(el);
            this._slots = slots;
            this._component = component;
            console.log(this._slots); 
            if (this.shadowMode) {
                this.shadow.adoptedStyleSheets = sheets;
                this.root = this.shadow;
            } else {
                this.root = this;
            }
        }

        connectedCallback() {
            console.log(`[Alpine Component] Initializing new ${componentName}`);
            copyAttributes(el, this);
            this.setAttribute("x-root", "");
            const props = Alpine.reactive({});

            let data = evaluateScriptSetup(this, setupScript, [], 
                { 
                    $host: this, 
                    $shadow: this.shadow,
                    defineProps: propsBuilder(this, props), 
                    ref, reactive, effect, computed, 
                },
            ) || {};
            data = { $props: props, ...data };
            Alpine.injectMagics(data, this);
            this.reactiveData = Alpine.reactive(data);
            Alpine.initInterceptors(this.reactiveData);
            this.undo = Alpine.addScopeToNode(this, this.reactiveData);
            this.applySlots();
            this.root.appendChild(this._component);
            Alpine.initTree(this.root);
            this.reactiveData['init'] &&  Alpine.evaluate(this, this.reactiveData['init']);
            console.log(`[Alpine Component] Finished setup of ${componentName}`);
        }

        disconnectCallback() {
            this.reactiveData['destroy'] && Alpine.evaluate(this, this.reactiveData['destroy'])
            this.undo()
        }

        attributeChangedCallback() {
            
        }

        processComponent(node) {
            const component = node.tagName === "TEMPLATE" ? node.content.cloneNode(true) : node.cloneNode(true);
            return { component, slots: Array.from(component.querySelectorAll("slot")) };
        }

        scopeElements(elements) {
            Array.from(elements).filter(el => !el._x_dataStack).forEach(el => {
                console.log("adding scope to ", el);
                Alpine.addScopeToNode(el, {}, this);
            });
        }

        applySlots() {
            if (this._slots) {
                const scopable = this.querySelectorAll("*");
                const defaultContent = Array.from(this.children).filter(el => el.tagName !== 'template');
                Array.from(this.children).forEach(child => child.remove());
                const textContent = this.textContent;
                this.textContent = "";
                this.scopeElements(scopable);
                console.log(defaultContent, scopable, textContent);
                this._slots.forEach(slot => {
                    if (!slot.hasAttribute("name")) {
                        slot.replaceWith(...defaultContent, textContent);
                    }
                })
            }
        }
    }
    try {
        customElements.define(componentName, AlpineWebComponent);
        registeredComponents.add(componentName);
        console.log(`[Alpine Globals] ✓ Registered: ${componentName}`);
    } catch (error) {
        console.error(`[Alpine Globals] Failed to register "${componentName}":`, error);
    }
}