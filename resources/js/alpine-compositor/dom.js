/**
 * DOM Strategy Pattern for Alpine Web Components
 * Abstracts light DOM, shadow DOM, and unwrap modes behind a unified interface
 */

import { getDebugMode } from "./registery.js";

function debugLog(strategy, phase, ...args) {
    if (!getDebugMode()) return;
    const componentName = strategy.host?.tagName?.toLowerCase() || 'unknown';
    console.log(`[DOM Strategy] ${componentName} | ${phase}`, ...args);
}

/**
 * Clone and process a component template
 * Returns the cloned content and slots found within it
 */
function processComponent(node) {
    const component = node.tagName === "TEMPLATE" 
        ? node.content.cloneNode(true) 
        : node.cloneNode(true);
    return { 
        component, 
        slots: Array.from(component.querySelectorAll("slot")) 
    };
}


class BaseDOMStrategy {
    constructor(host, templateEl, styleSheets, Alpine) {
        this.host = host;
        this.templateEl = templateEl;
        this.styleSheets = styleSheets;
        this.Alpine = Alpine;
        this.root = null;
        this.container = null;
        this.component = null;
        this.slots = [];
    }

    /** Initialize the strategy - called in constructor */
    init() { throw new Error('Not implemented'); }

    /**
     * Mark all elements in the component template as authored by the host
     * This should be called after cloning the template, before appending
     */
    markTemplateElements() {
        if (!this.component) return;
        
        const markAsAuthored = (element, owner) => {
            // Skip if already marked
            if (element._m_parentComponent) return;
            
            const tagName = element.tagName.toLowerCase();
            
            // Special handling for <template> elements (e.g., x-for, x-if)
            // Don't mark the template itself, only its content
            if (tagName === 'template' && element.content) {
                // Mark elements inside the template content
                Array.from(element.content.children).forEach(contentChild => {
                    markAsAuthored(contentChild, owner);
                });
                return; // Don't mark the template itself or recurse into its children
            }
            
            // Mark this element
            element._m_parentComponent = owner;
            
            if (getDebugMode()) {
                debugLog(this, 'MARK_TEMPLATE', 
                    `Marked ${element.tagName.toLowerCase()} as authored by ${owner.tagName.toLowerCase()}`);
            }
            
            // Recurse into children, but stop at custom elements
            Array.from(element.children).forEach(child => {
                const childTagName = child.tagName.toLowerCase();
                if (!customElements.get(childTagName)) {
                    markAsAuthored(child, owner);
                }
            });
        };
        
        // Handle different component types
        let elementsToMark = [];
        
        if (this.component instanceof DocumentFragment) {
            // Shadow/Light DOM: component is a DocumentFragment
            elementsToMark = Array.from(this.component.children);
        } else if (this.component instanceof HTMLCollection) {
            // Unwrap mode: component is HTMLCollection of children
            elementsToMark = Array.from(this.component);
        } else if (this.component instanceof Element) {
            // Single element
            elementsToMark = [this.component];
        }
        
        // Mark each top-level element
        elementsToMark.forEach(child => {
            const tagName = child.tagName.toLowerCase();
            
            // If it's a custom element, mark its slot content (children)
            if (customElements.get(tagName)) {
                Array.from(child.children).forEach(slotContent => {
                    markAsAuthored(slotContent, this.root);
                });
            } else {
                // Regular element, mark it and recurse
                markAsAuthored(child, this.root);
            }
        });
    }

    /** Check if host is inside a shadow DOM */
    isInShadowDOM() {
        return this.host.getRootNode() instanceof ShadowRoot;
    }

    /** 
     * Get the effective parent container (respects shadow DOM)
     */
    getEffectiveParent() {
        const rootNode = this.host.getRootNode();
        if (rootNode instanceof ShadowRoot) {
            return rootNode;
        }
        const parent = this.host.parentElement || this.host.parentNode?.host;
        return parent?._m_shadow || parent;
    }

    /** Get the element that should receive Alpine scope/data */
    getScopeTarget() { return this.root; }

    /** Get the root for Alpine.initTree */
    getInitRoot() { return this.container; }

    /** Get the shadow root if any */
    getShadow() { return null; }

    /**
     * Apply slots - properly scopes slot content to authoring context, then distributes
     * 
     * Key insight: Slot content should be scoped to where it was AUTHORED (parent component),
     * not where it's RENDERED (this component with <slot>).
     * 
     * The _m_parentComponent property tracks authoring context and is set during connectedCallback.
     * We use it here to scope elements to the correct Alpine context before distribution.
     */
    applySlots() {
        if (!this.slots || this.slots.length === 0) {
            debugLog(this, 'APPLY_SLOTS', 'No slots found, skipping');
            return;
        }

        debugLog(this, 'APPLY_SLOTS', `Found ${this.slots.length} slot(s)`);
        
        const root = this.root;
        
        // 1. Extract slot content from root
        const defaultContent = Array.from(root.children);
        debugLog(this, 'EXTRACT', `Extracted ${defaultContent.length} child element(s) from root`);
        
        // 2. Collect all elements in slot content (direct children + nested)
        // Start with direct children, then recursively collect nested elements
        const allSlotElements = [...defaultContent];
        const collectNestedElements = (parent) => {
            Array.from(parent.children).forEach(child => {
                allSlotElements.push(child);
                
                const tagName = child.tagName.toLowerCase();
                
                // Special handling for <template> elements (e.g., x-for, x-if)
                if (tagName === 'template' && child.content) {
                    // Collect elements from inside the template content
                    Array.from(child.content.children).forEach(contentChild => {
                        allSlotElements.push(contentChild);
                        const contentTagName = contentChild.tagName.toLowerCase();
                        if (!customElements.get(contentTagName)) {
                            collectNestedElements(contentChild);
                        }
                    });
                }
                
                // Don't recurse into custom elements - they handle their own content
                if (!customElements.get(tagName)) {
                    collectNestedElements(child);
                }
            });
        };
        // Collect nested elements from each direct child (but not from custom elements)
        defaultContent.forEach(parent => {
            const tagName = parent.tagName.toLowerCase();
            
            // Special handling for <template> at root level
            if (tagName === 'template' && parent.content) {
                Array.from(parent.content.children).forEach(contentChild => {
                    allSlotElements.push(contentChild);
                    const contentTagName = contentChild.tagName.toLowerCase();
                    if (!customElements.get(contentTagName)) {
                        collectNestedElements(contentChild);
                    }
                });
            } else if (!customElements.get(tagName)) {
                collectNestedElements(parent);
            }
        });
        
        debugLog(this, 'COLLECT', `Collected ${allSlotElements.length} element(s) total (including nested)`);
        
        // 3. Scope each element to its authoring context BEFORE moving it
        // Elements with _m_parentComponent were authored elsewhere and need scoping to that context
        let scopedCount = 0;
        let rescoped = 0;
        let skipped = 0;
        
        allSlotElements.forEach(el => {
            // Skip template elements - Alpine handles these
            if (el.tagName === 'TEMPLATE') return;
            
            // Only scope elements that have an authoring component
            if (!el._m_parentComponent) {
                if (getDebugMode()) {
                    debugLog(this, 'SCOPE', `Skipping ${el.tagName.toLowerCase()} - no _m_parentComponent`);
                }
                return;
            }
            
            // Check if already correctly scoped to the right parent
            const currentScope = el._x_dataStack?.[0];
            const targetScope = el._m_parentComponent._x_dataStack?.[0];
            
            // If already scoped to the correct parent, skip
            if (currentScope && targetScope && currentScope === targetScope) {
                skipped++;
                if (getDebugMode()) {
                    debugLog(this, 'SCOPE', 
                        `${el.tagName.toLowerCase()} already correctly scoped to ${el._m_parentComponent.tagName.toLowerCase()}`);
                }
                return;
            }
            
            // Clear any existing Alpine state before re-scoping
            if (el._x_dataStack) {
                rescoped++;
                if (getDebugMode()) {
                    debugLog(this, 'RESCOPE', 
                        `Clearing old scope from ${el.tagName.toLowerCase()} before re-scoping`);
                }
                delete el._x_dataStack;
                delete el._x_inlineBindings;
                delete el._x_effects;
                delete el._x_ignoreSelf;
                // Clear any other Alpine-specific properties
                Object.keys(el).forEach(key => {
                    if (key.startsWith('_x_')) delete el[key];
                });
            }
            
            // Scope to the component that authored this element
            this.Alpine.addScopeToNode(el, {}, el._m_parentComponent);
            scopedCount++;
            
            if (getDebugMode()) {
                debugLog(this, 'SCOPE', 
                    `Scoped ${el.tagName.toLowerCase()} to ${el._m_parentComponent.tagName.toLowerCase()}`);
            }
        });
        
        debugLog(this, 'SCOPE_SUMMARY', 
            `Scoped: ${scopedCount}, Re-scoped: ${rescoped}, Already correct: ${skipped}`);
        
        // 4. Remove children from root (now that they're scoped)
        defaultContent.forEach(child => child.remove());
        
        // 5. Distribute scoped content to slots
        this.slots.forEach(slot => {
            if (!slot.hasAttribute("name")) {
                debugLog(this, 'DISTRIBUTE', `Replacing default slot with ${defaultContent.length} element(s)`);
                slot.replaceWith(...defaultContent);
            }
        });
        
        debugLog(this, 'APPLY_SLOTS', 'Slot processing complete');
    }

    /**
     * Get elements to append after slot processing
     * Returns array of elements/nodes to append
     */
    getElementsToAppend() {
        return [this.component];
    }

    /**
     * Append processed component to the appropriate container
     */
    appendComponent() {
        const elements = this.getElementsToAppend();
        this.container.append(...elements);
    }

    /** Cleanup when element is removed */
    cleanup(callback) {
        // Default: no special cleanup needed
    }
}


class ShadowDOMStrategy extends BaseDOMStrategy {
    init() {
        this.shadow = this.host.attachShadow({ mode: 'open' });
        this.shadow.adoptedStyleSheets = this.styleSheets;
        this.root = this.host;
        this.container = this.shadow;
        
        // Store shadow ref on host for nested component detection
        this.host._m_shadow = this.shadow;
        
        // Process component template
        const { component, slots } = processComponent(this.templateEl);
        this.component = component;
        this.slots = slots;
    }

    getShadow() {
        return this.shadow;
    }
}


class LightDOMStrategy extends BaseDOMStrategy {
    init() {
        this.root = this.host;
        this.container = this.host;
        
        // Process component template
        const { component, slots } = processComponent(this.templateEl);
        this.component = component;
        this.slots = slots;
    }
}


class UnwrapStrategy extends BaseDOMStrategy {
    constructor(host, templateEl, styleSheets, Alpine) {
        super(host, templateEl, styleSheets, Alpine);
        this.unwrappedEl = null;
    }

    init() {
        // Initial state before mount
        this.root = this.host;
        this.container = this.host;
    }

    /**
     * Mount the unwrapped element - replaces the host with the template's first child
     * Must be called in connectedCallback before other operations
     */
    mount(copyAttributesFn) {
        // Clone the template's first element child
        const firstChild = this.templateEl.tagName === 'TEMPLATE'
            ? this.templateEl.content.firstElementChild.cloneNode(true)
            : this.templateEl.firstElementChild.cloneNode(true);

        if (!firstChild) {
            console.error('[UnwrapStrategy] Template must have a first element child');
            return null;
        }

        // Copy attributes from host to the unwrapped element
        copyAttributesFn(this.host, firstChild);

        // Process the firstChild to get component and slots (matches original behavior)
        const { component, slots } = processComponent(firstChild);
        this.component = component.children; // HTMLCollection of inner children
        this.slots = slots;
        // Store reference back to original host
        firstChild._m_unwrappedRef = this.host;

        // Clear firstChild and move host's children into it
        firstChild.innerHTML = "";
        firstChild.append(...this.host.childNodes);
        firstChild._x_dataStack = this.host._x_dataStack;

        // Replace host with unwrapped element
        this.host.replaceWith(firstChild);

        this.unwrappedEl = firstChild;
        this.root = firstChild;
        this.container = firstChild;

        return firstChild;
    }

    getScopeTarget() {
        return this.unwrappedEl || this.host;
    }

    getInitRoot() {
        return this.unwrappedEl || this.host;
    }

    /**
     * For unwrap, we append the component's children (HTMLCollection)
     * This matches: appendElements(root, this._m_unwrap ? this._m_component : [this._m_component])
     */
    getElementsToAppend() {
        // Convert HTMLCollection to array
        return Array.from(this.component);
    }

    cleanup(callback) {
        if (this.unwrappedEl) {
            this.Alpine.onElRemoved(this.unwrappedEl, callback);
        }
    }
}


/**
 * Factory to create the appropriate strategy based on element attributes
 */
export function createDOMStrategy(host, templateEl, styleSheets, Alpine) {
    const shouldUnwrap = templateEl.hasAttribute('unwrap');
    const useLightDOM = !templateEl.hasAttribute('shadow');

    if (shouldUnwrap) {
        return new UnwrapStrategy(host, templateEl, styleSheets, Alpine);
    } else if (useLightDOM) {
        return new LightDOMStrategy(host, templateEl, styleSheets, Alpine);
    } else {
        return new ShadowDOMStrategy(host, templateEl, styleSheets, Alpine);
    }
}


export { BaseDOMStrategy, ShadowDOMStrategy, LightDOMStrategy, UnwrapStrategy };