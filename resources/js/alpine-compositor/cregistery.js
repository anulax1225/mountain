import evaluateScriptSetup from "./evaluator.js";
import Alpine from "../alpinejs";
import { ref, reactive, computed, effect, propsBuilder } from "./utils.js"

const registeredComponents = new Set();
const componentStyleSheet = new CSSStyleSheet();
componentStyleSheet.replaceSync(`
    :host {
        display: block;
        padding: 0;
        margin: 0;
        width: auto;
        height: auto;
        box-sizing: content;
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
    return registeredComponents.has(name);
}

// from https://github.com/vimeshjs/vimesh-ui - src/x-component.js
function copyAttributes(elFrom, elTo) {
    const DIR_DATA = Alpine.prefixed('data');
    const DIR_INIT = Alpine.prefixed('init');
    const DIR_COMP = Alpine.prefixed('component');
    const reject = [DIR_COMP, DIR_DATA, "unwrap"];
    Array.from(elFrom.attributes).forEach(attr => {
        if (reject.includes(attr.name)) return;
        try {
            let name = attr.name;
            if (name.startsWith('@'))
                name = `${Alpine.prefixed('on')}:${name.substring(1)}`
            else if (name.startsWith(':'))
                name = `${Alpine.prefixed('bind')}:${name.substring(1)}`
            if (DIR_INIT === name && elTo.getAttribute(DIR_INIT)) {
                elTo.setAttribute(name, attr.value + ';' + elTo.getAttribute(DIR_INIT))
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

function processComponent(node) {
    const component = node.tagName === "TEMPLATE" ? node.content.cloneNode(true) : node.cloneNode(true);
    return { component, slots: Array.from(component.querySelectorAll("slot")) };
}

function scopeElements(elements, parent) {
    Array.from(elements).filter(el => !el._x_dataStack).forEach(el => {
        Alpine.addScopeToNode(el, {}, parent);
    });
}

function applySlots(slots, parent) {
    if (slots) {
        const scopable = parent.querySelectorAll("*");
        const defaultContent = Array.from(parent.children).filter(el => el.tagName !== 'template');
        Array.from(parent.children).forEach(child => child.remove());
        const textContent = parent.textContent;
        parent.textContent = "";
        scopeElements(scopable, parent);
        slots.forEach(slot => {
            if (!slot.hasAttribute("name")) {
                slot.replaceWith(...defaultContent, textContent);
            }
        })
    }
}

function appendElements(parent, elements) {
    if (parent._m_shadow) parent._m_shadow.append(...elements)
    else parent.append(...elements)
}

export function registerComponent(el, componentName, setupScript = "return {}") {
    //console.log("[Alpine Global] New component in registration " + componentName)
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
            //console.log(`[Alpine Component] ${componentName} should unwrap ${el.hasAttribute("unwrap")}`)
            this._m_unwrap = el.hasAttribute("unwrap");
            this._m_shadowMode = !this._m_unwrap || !el.hasAttribute("light");
            this._m_shadow = this._m_shadowMode ? this.attachShadow({ mode: 'open' }) : null;
            const { component, slots } = processComponent(el);
            this._m_slots = slots;
            this._m_component = component;
            if (this._m_shadowMode) {
                this._m_shadow.adoptedStyleSheets = sheets;
                this._m_root = this._m_shadow;
            } else this._m_root = this;
        }

        connectedCallback() {
            let root = this;
            const parent = !!this.parentElement ? this.parentElement : this.parentNode.host;
            if (this._m_unwrap) {
                const firstChild = el.tagName === "TEMPLATE" ? el.content.firstElementChild.cloneNode(true) : el.firstElementChild.cloneNode(true);
                copyAttributes(this, firstChild);
                this._m_root = firstChild;
                const { component, slots } = processComponent(firstChild);
                this._m_slots = slots;
                this._m_component = component.children;
                firstChild._m_unwrappedRef = this;
                root = firstChild;
                firstChild.innerHTML = "";
                firstChild.append(...this.childNodes);
                console.log("unwrap", this.cloneNode(true), this.childNodes, this.children);
                (parent._m_shadow ?  parent._m_shadow : parent).appendChild(firstChild);
                this.remove();
                Alpine.onElRemoved(firstChild, () => {
                    root._m_reactiveData['destroy'] && Alpine.evaluate(this, this._m_reactiveData['destroy'])
                    root._m_undo();
                });
            }

            console.log(`[Alpine Component] Initializing new ${componentName}`);
            copyAttributes(el, root);
            root.setAttribute("x-root", "");

            root._m_props = Alpine.reactive({});
            let data = evaluateScriptSetup(root, setupScript, [],
                {
                    $host: root,
                    $shadow: this._m_shadow,
                    defineProps: propsBuilder(root, root._m_props),
                    ref, reactive, effect, computed,
                },
            ) || {};
            data = { $props: root._m_props, ...data };
            Alpine.injectMagics(data, root);
            root._m_reactiveData = Alpine.reactive(data);
            Alpine.initInterceptors(root._m_reactiveData);
            root._m_undo = Alpine.addScopeToNode(root, root._m_reactiveData);

            applySlots(this._m_slots, root);
            appendElements(root, this._m_unwrap ? this._m_component : [this._m_component]);
            Alpine.initTree(this._m_root);
            root._m_reactiveData['init'] && Alpine.evaluate(root, root._m_reactiveData['init']);
        }

        disconnectCallback() {
            console.log("disconnected", componentName, this._m_unwrap);
            if (this._m_unwrap) return;
            this._m_reactiveData['destroy'] && Alpine.evaluate(this, this._m_reactiveData['destroy'])
            this._m_undo()
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