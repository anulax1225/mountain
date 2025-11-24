import evaluateScriptSetup from "./evaluator.js";
import Alpine from "../alpinejs";
import { ref, reactive, computed, effect, propsBuilder } from "./utils.js";
import { createDOMStrategy } from "./dom.js";

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

// Initialization batching system
// All components defer to microtask to ensure parent DOM is ready before children init
let pendingInits = [];
let batchScheduled = false;

function scheduleInit(host, initFn) {
    pendingInits.push({ host, init: initFn });
    
    if (!batchScheduled) {
        batchScheduled = true;
        queueMicrotask(processBatch);
    }
}

function processBatch() {
    batchScheduled = false;
    
    // Take current batch
    const batch = pendingInits;
    pendingInits = [];
    
    // Filter out disconnected and already-initialized elements
    const connected = batch.filter(item => {
        // Skip disconnected elements
        if (!item.host.isConnected) {
            item.host._m_scheduled = false;
            return false;
        }
        // Skip already initialized (safety check)
        if (item.host._m_initialized) {
            item.host._m_scheduled = false;
            return false;
        }
        return true;
    });
    
    // Sort by DOM order (parents before children)
    connected.sort((a, b) => {
        const pos = a.host.compareDocumentPosition(b.host);
        if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
    });
    
    // Initialize in order
    for (const item of connected) {
        item.init();
    }
}


export function registerStyleSheet(sheet) {
    sheets.push(sheet);
    //console.log("[Alpine Styles] ✓ Registered new style sheet");
}

export function hasComponent(name) {
    return registeredComponents.has(name);
}

export function mergeAttributes(el, attributes) {
    if (el && attributes) {
        Array.from(attributes).forEach(attr => {
            if (!el.hasAttribute(attr.name) && attr.name !== "x-component") {
                el.setAttribute(attr.name, attr.value);
            }
        });
    }
}

// from https://github.com/vimeshjs/vimesh-ui - src/x-component.js
function copyAttributes(elFrom, elTo) {
    const DIR_DATA = Alpine.prefixed('data');
    const DIR_INIT = Alpine.prefixed('init');
    const DIR_COMP = Alpine.prefixed('component');
    const reject = [DIR_COMP, DIR_DATA, "unwrap", "light"];

    Array.from(elFrom.attributes).forEach(attr => {
        if (reject.includes(attr.name)) return;
        try {
            let name = attr.name;
            if (name.startsWith('@')) {
                name = `${Alpine.prefixed('on')}:${name.substring(1)}`;
            } else if (name.startsWith(':')) {
                name = `${Alpine.prefixed('bind')}:${name.substring(1)}`;
            }

            if (DIR_INIT === name && elTo.getAttribute(DIR_INIT)) {
                elTo.setAttribute(name, attr.value + ';' + elTo.getAttribute(DIR_INIT));
            } else if ('class' === name) {
                elTo.setAttribute(name, attr.value + ' ' + (elTo.getAttribute('class') || ''));
            } else if (!elTo.hasAttribute(name)) {
                elTo.setAttribute(name, attr.value);
            }
        } catch (ex) {
            console.warn(`Fails to set attribute ${attr.name}=${attr.value} in ${elTo.tagName.toLowerCase()}`);
        }
    });
}

function scopeElements(elements, parent) {
    Array.from(elements).forEach(el => {
        // Skip if already scoped
        if (el._x_dataStack) return;
        
        // Only scope elements owned by this component
        if (el._m_parentComponent !== parent) return;
        
        Alpine.addScopeToNode(el, {}, parent);
    });
}


export function registerComponent(el, componentName, setupScript = "return {}") {
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
    let count = 0;
    class AlpineWebComponent extends HTMLElement {
        constructor() {
            super();
            console.log(`[Alpine Component] "${componentName}" constructor ${this.innerHTML}`)
            this._m_strategy = createDOMStrategy(this, el, sheets, Alpine);
            this._m_strategy.init();
            this.localCount = count++;
            this._m_initialized = false;
            this._m_scheduled = false;
        }

        connectedCallback() {
            console.log(`[Alpine Component] Initializing ${componentName} N°${this.localCount} ${this.innerHTML}`);
            // Prevent double initialization
            if (this._m_initialized) return;
            
            // Prevent duplicate scheduling (can happen if disconnected/reconnected before microtask)
            if (this._m_scheduled) return;
            
            // Mark slot content as belonging to this component
            // Uses recursive traversal but stops at nested custom elements
            // (they will mark their own slot content in their connectedCallback)
            const markSlotContent = (parent, owner) => {
                Array.from(parent.children).forEach(child => {
                    if (child._m_parentComponent) return;
                    child._m_parentComponent = owner;
                    // Don't recurse into custom elements - they own their own slot content
                    const tagName = child.tagName.toLowerCase();
                    if (!customElements.get(tagName)) {
                        markSlotContent(child, owner);
                    }
                });
            };
            markSlotContent(this, this);
            
            // Mark to skip during any early initTree calls
            this.setAttribute('x-ignore', '');
            
            // Mark as scheduled
            this._m_scheduled = true;
            
            // Defer to microtask - allows all sync DOM operations to complete
            // and ensures we can sort by DOM order
            scheduleInit(this, () => this._doInit());
        }

        _doInit() {
            // Clear scheduled flag
            this._m_scheduled = false;
            
            // Always remove skip marker (must happen before guards to ensure cleanup)
            this.removeAttribute('x-ignore');
            
            // Prevent double initialization
            if (this._m_initialized) return;
            
            // Skip if no longer connected
            if (!this.isConnected) return;
            
            this._m_initialized = true;
            this._initComponent();
        }

        _initComponent() {
            console.log(`[Alpine Component] Initializing ${componentName} N°${this.localCount}`);
            const strategy = this._m_strategy;
            const isUnwrap = el.hasAttribute('unwrap');

            // For unwrap mode, mount first to get the real root element
            if (isUnwrap) {
                const mounted = strategy.mount(copyAttributes);
                if (!mounted) return;

                // Update _m_parentComponent on slot content to point to new root
                // (was set to host in connectedCallback, now needs to be unwrappedEl)
                const newRoot = strategy.getScopeTarget();
                const updateOwner = (parent) => {
                    Array.from(parent.children).forEach(child => {
                        if (child._m_parentComponent === this) {
                            child._m_parentComponent = newRoot;
                        }
                        // Don't descend into custom elements
                        const tagName = child.tagName.toLowerCase();
                        if (!customElements.get(tagName)) {
                            updateOwner(child);
                        }
                    });
                };
                updateOwner(newRoot);

                // Setup cleanup for unwrap mode (must be done early, before any errors)
                strategy.cleanup(() => {
                    const root = strategy.getScopeTarget();
                    if (root._m_reactiveData?.destroy) {
                        Alpine.evaluate(root, root._m_reactiveData.destroy);
                    }
                    if (root._m_undo) {
                        root._m_undo();
                    }
                });
            }

            const root = strategy.getScopeTarget();

            // Store references on custom element for compatibility
            this._m_shadow = strategy.getShadow();
            this._m_root = strategy.getInitRoot();

            // Copy template attributes to root
            copyAttributes(el, root);
            root.setAttribute('x-root', '');

            // Setup Alpine reactivity
            root._m_props = Alpine.reactive({});

            let data = evaluateScriptSetup(root, setupScript, [], {
                $host: root,
                $shadow: strategy.getShadow(),
                defineProps: propsBuilder(root, root._m_props),
                ref, reactive, effect, computed,
            }) || {};

            data = { $props: root._m_props, ...data };
            Alpine.injectMagics(data, root);
            root._m_reactiveData = Alpine.reactive(data);
            Alpine.initInterceptors(root._m_reactiveData);
            root._m_undo = Alpine.addScopeToNode(root, root._m_reactiveData);

            // Apply slots (extracts from root, replaces in component)
            strategy.applySlots((scopables, parent) => {
                console.log(`[Alpine Component] Scoping ${componentName} N°${this.localCount}`, scopables);
                scopeElements(scopables, parent);
            });

            // Append the processed component first
            strategy.appendComponent();

            console.log(`[Alpine Component] Finished ${componentName} N°${this.localCount}`);

            // Initialize Alpine tree once after everything is in place
            Alpine.initTree(strategy.getInitRoot());

            // Call init lifecycle
            if (root._m_reactiveData.init) {
                Alpine.evaluate(root, root._m_reactiveData.init);
            }
        }

        disconnectedCallback() {
            console.log(`[Alpine Component] Disconnecting ${componentName} N°${this.localCount} init(${this._m_initialized})`);
            if (!this._m_initialized) return;
            // Clear scheduled flag if still pending
            this._m_scheduled = false;
            
            // Clean up x-ignore marker if still pending
            this.removeAttribute('x-ignore');
            
            // Skip cleanup for unwrap mode (handled by onElRemoved)
            if (el.hasAttribute('unwrap')) return;

            // Only run cleanup if actually initialized
            if (!this._m_initialized) return;

            const root = this._m_strategy.getScopeTarget();
            if (root._m_reactiveData?.destroy) {
                Alpine.evaluate(root, root._m_reactiveData.destroy);
            }
            if (root._m_undo) {
                root._m_undo();
            }
        }
    }

    try {
        customElements.define(componentName, AlpineWebComponent);
        registeredComponents.add(componentName);
        //console.log(`[Alpine Globals] ✓ Registered: ${componentName}`);
    } catch (error) {
        console.error(`[Alpine Globals] Failed to register "${componentName}":`, error);
    }
}