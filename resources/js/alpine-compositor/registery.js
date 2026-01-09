import evaluateScriptSetup from "./evaluator.js";
import Alpine from "../alpinejs/index.js";
import {
    ref, reactive, computed, effect,
    propsBuilder, shallowRef, writableComputed,
    watchEffect, unref, readonly, isComputed, isRef,
    stop, toRaw, toRef, toRefs, watch,
} from "./utils.js";
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

// Debug mode
let DEBUG = false;

export function setDebugMode(enabled) {
    DEBUG = enabled;
}

export function getDebugMode() {
    return DEBUG;
}

function debugLog(componentName, phase, ...args) {
    if (!DEBUG) return;
    console.log(`[Alpine Component] ${componentName} | ${phase}`, ...args);
}

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
    if (DEBUG) console.log('[Alpine Component] Processing batch of', pendingInits.length, 'components');

    // Take current batch
    const batch = pendingInits;
    pendingInits = [];

    // Filter out disconnected and already-initialized elements
    const connected = batch.filter(item => {
        // Skip disconnected elements
        if (!item.host.isConnected) {
            item.host._m_scheduled = false;
            if (DEBUG) console.log('[Alpine Component] Skipping disconnected:', item.host.tagName);
            return false;
        }
        // Skip already initialized (safety check)
        if (item.host._m_initialized) {
            item.host._m_scheduled = false;
            if (DEBUG) console.log('[Alpine Component] Skipping already initialized:', item.host.tagName);
            return false;
        }
        return true;
    });

    if (DEBUG) console.log('[Alpine Component] Connected components:', connected.length);

    // Sort by DOM order (parents before children)
    connected.sort((a, b) => {
        const pos = a.host.compareDocumentPosition(b.host);
        if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
    });

    if (DEBUG) {
        console.log('[Alpine Component] Initialization order:',
            connected.map(item => item.host.tagName.toLowerCase()).join(' → '));
    }

    // Initialize in order
    for (const item of connected) {
        item.init();
    }

    if (DEBUG) console.log('[Alpine Component] Batch complete\n');
}


export function registerStyleSheet(sheet) {
    sheets.push(sheet);
    console.log("[Alpine Styles] ✓ Registered new style sheet");
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
                elTo.setAttribute(name, ((elTo.getAttribute('class') || '') + " " + attr.value).trim());
            } else if (!elTo.hasAttribute(name)) {
                elTo.setAttribute(name, attr.value);
            }
        } catch (ex) {
            console.warn(`Fails to set attribute ${attr.name}=${attr.value} in ${elTo.tagName.toLowerCase()}`);
        }
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

    class AlpineWebComponent extends HTMLElement {
        constructor() {
            super();
            this._m_strategy = createDOMStrategy(this, el, sheets, Alpine);
            this._m_strategy.init();
            this._m_strategy.root.style.display = "none";
            this._m_initialized = false;
            this._m_scheduled = false;
            this.localCount = 0;

            this._m_scheduled = true;
            this.markSlotContent(this, this);
            this._doInit()
            console.log(componentName, 'CONSTRUCTOR', 'Created new instance');
        }

        connectedCallback() {
            this.localCount++;
            console.log(componentName, 'CONNECTED', 'Element connected to DOM', this.localCount);

            if (this._m_initialized || this._m_scheduled) {
                debugLog(componentName, 'CONNECTED', 'Already initialized or scheduled, skipping');
                return;
            }

            // Mark slot content with authoring context
            // This tracks which component authored each element, enabling proper scope resolution
            // Recursively marks children but stops at custom elements (they mark their own content)

            
            debugLog(componentName, 'CONNECTED', 'Scheduled for initialization');
            //scheduleInit(this, () => );
        }

        markSlotContent(parent, owner, override = false) {
            Array.from(parent.children).forEach(child => {
                if (child._m_parentComponent && !override) return;

                const tagName = child.tagName.toLowerCase();

                // Special handling for <template> elements (e.g., x-for, x-if)
                // Don't mark the template itself, only its content
                if (tagName === 'template' && child.content) {
                    // Mark the content inside the template
                    Array.from(child.content.children).forEach(contentChild => {
                        if (!customElements.get(tagName)) {
                            this.markSlotContent(contentChild, owner, override);
                        }
                    });
                    return; // Don't mark the template itself or recurse normally
                }

                child._m_parentComponent = owner;

                if (DEBUG) {
                    debugLog(componentName, 'MARK_SLOT',
                        `Marked ${child.tagName.toLowerCase()} as authored by ${owner.tagName.toLowerCase()}`);
                }

                // Don't recurse into custom elements - they own their own slot content
                this.markSlotContent(child, owner, override);
            });
        }

        _doInit() {
            debugLog(componentName, 'DO_INIT', 'Starting initialization');

            this._m_scheduled = false;
            if (this._m_initialized || !this.isConnected) {
                debugLog(componentName, 'DO_INIT', 'Already initialized or disconnected, skipping');
                return;
            }
            this._m_initialized = true;

            this._initComponent();
            this._m_strategy.root.style.display = "";
        }

        _initComponent() {
            debugLog(componentName, 'INIT_COMPONENT', 'Beginning component initialization');

            const strategy = this._m_strategy;
            const isUnwrap = el.hasAttribute('unwrap');

            // Unwrap mode: mount first to get the real root element
            if (isUnwrap) {
                debugLog(componentName, 'UNWRAP', 'Unwrapping component');

                const mounted = strategy.mount(copyAttributes);
                if (!mounted) {
                    debugLog(componentName, 'UNWRAP', 'Mount failed');
                    return;
                }

                const newRoot = strategy.getScopeTarget();
                this.markSlotContent(newRoot, newRoot, true);

                strategy.cleanup(() => {
                    debugLog(componentName, 'CLEANUP', 'Running unwrap cleanup');
                    const root = strategy.getScopeTarget();
                    if (root._m_reactiveData?.destroy) {
                        Alpine.evaluate(root, root._m_reactiveData.destroy);
                    }
                    if (root._m_undo) {
                        root._m_undo();
                    }
                });
            }

            // Mark all template elements as authored by this component
            // For unwrap mode, this happens after mount() when component is set
            // For other modes, this happens now (component was set in init())

            const root = strategy.getScopeTarget();

            this._m_shadow = strategy.getShadow();
            this._m_root = strategy.getInitRoot();

            copyAttributes(el, root);
            root.setAttribute('x-element', '');

            debugLog(componentName, 'ALPINE_SETUP', 'Setting up Alpine reactivity');

            // Setup Alpine reactivity
            root._m_props = Alpine.reactive({});
            let scopedData = {};
            Alpine.injectDataProviders(scopedData);
            Object.assign(scopedData, {
                $host: root,
                $shadow: strategy.getShadow(),
                defineProps: propsBuilder(root, root._m_props),
                ref, reactive, effect, computed,
                shallowRef, writableComputed, watchEffect,
                unref, readonly, isComputed, isRef, stop, toRaw,
                toRef, toRefs, watch,
            });
            let data = evaluateScriptSetup(root, setupScript, [], scopedData) || {};
            console.log("ss", data);
            data = { $props: root._m_props, ...data };
            Alpine.injectMagics(data, root);

            //Alpine.injectDataProviders(scopedData, data);
            root._m_reactiveData = Alpine.reactive(data);
            Alpine.initInterceptors(root._m_reactiveData);
            root._m_undo = Alpine.addScopeToNode(root, root._m_reactiveData);

            if (DEBUG) {
                debugLog(componentName, 'PROPS', 'Defined props:', Object.keys(root._m_props));
            }

            strategy.markTemplateElements();

            // Apply slots: scope content to authoring context, then distribute
            debugLog(componentName, 'APPLY_SLOTS', 'Processing slots');
            strategy.applySlots();

            strategy.appendComponent();
            debugLog(componentName, 'APPEND', 'Component appended to DOM');
            Alpine.initTree(strategy.getInitRoot());
            debugLog(componentName, 'ALPINE_INIT', 'Alpine.initTree completed');

            if (root._m_reactiveData.init) {
                debugLog(componentName, 'LIFECYCLE', 'Calling init() hook');
                Alpine.evaluate(root, root._m_reactiveData.init);
            }

            debugLog(componentName, 'COMPLETE', 'Initialization complete ✓\n');
        }

        disconnectCallback() {
            // console.log(componentName, 'DISCONNECTED', 'Element disconnected from DOM', this.localCount);

            // if (!this._m_initialized) {
            //     debugLog(componentName, 'DISCONNECTED', 'Never initialized, skipping cleanup');
            //     return;
            // }

            // this._m_scheduled = false;

            // // Clean up slot content elements
            // debugLog(componentName, 'CLEANUP', 'Cleaning up slot content');
            // const cleanupSlotContent = (parent) => {
            //     Array.from(parent.children).forEach(child => {
            //         // Clear Alpine state
            //         if (child._x_dataStack) {
            //             Object.keys(child).forEach(key => {
            //                 if (key.startsWith('_x_')) delete child[key];
            //             });
            //             if (DEBUG) {
            //                 debugLog(componentName, 'CLEANUP', `Cleared Alpine state from ${child.tagName.toLowerCase()}`);
            //             }
            //         }
            //         // Clear parent component marker
            //         if (child._m_parentComponent === this) {
            //             delete child._m_parentComponent;
            //             if (DEBUG) {
            //                 debugLog(componentName, 'CLEANUP', `Cleared ownership from ${child.tagName.toLowerCase()}`);
            //             }
            //         }

            //         const tagName = child.tagName.toLowerCase();

            //         // Special handling for <template> elements
            //         if (tagName === 'template' && child.content) {
            //             Array.from(child.content.children).forEach(contentChild => {
            //                 if (contentChild._x_dataStack) {
            //                     Object.keys(contentChild).forEach(key => {
            //                         if (key.startsWith('_x_')) delete contentChild[key];
            //                     });
            //                 }
            //                 if (contentChild._m_parentComponent === this) {
            //                     delete contentChild._m_parentComponent;
            //                 }
            //                 const contentTagName = contentChild.tagName.toLowerCase();
            //                 if (!customElements.get(contentTagName)) {
            //                     cleanupSlotContent(contentChild);
            //                 }
            //             });
            //         }

            //         // Don't recurse into custom elements
            //         if (!customElements.get(tagName)) {
            //             cleanupSlotContent(child);
            //         }
            //     });
            // };
            // cleanupSlotContent(this);

            // if (el.hasAttribute('unwrap')) {
            //     debugLog(componentName, 'CLEANUP', 'Unwrap mode, skipping root cleanup');
            //     return;
            // }

            // debugLog(componentName, 'CLEANUP', 'Cleaning up root component');
            // const root = this._m_strategy.getScopeTarget();
            // if (root._m_reactiveData?.destroy) {
            //     debugLog(componentName, 'LIFECYCLE', 'Calling destroy() hook');
            //     Alpine.evaluate(root, root._m_reactiveData.destroy);
            // }

            // debugLog(componentName, 'CLEANUP', 'Cleanup complete\n');
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