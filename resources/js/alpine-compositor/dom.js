/**
 * DOM Strategy Pattern for Alpine Web Components
 * Abstracts light DOM, shadow DOM, and unwrap modes behind a unified interface
 */

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
     * Apply slots - extracts content from root and replaces slots in component
     * This matches the original applySlots behavior exactly
     */
    applySlots(scopeElementsFn) {
        if (!this.slots) return;

        const root = this.root;
        // Get scopable elements BEFORE any DOM manipulation
        const scopables = Array.from(root.querySelectorAll("*")).filter(scopable => !scopable._m_parentComponent);
        // Note: original uses lowercase 'template' which never matches (tagName is uppercase)
        // Keeping same behavior for compatibility
        const defaultContent = Array.from(root.children);
        
        // Remove children from root
        Array.from(root.children).forEach(child => child.remove());
        
        // Capture and clear text content
        const textContent = root.textContent;
        root.textContent = "";
        
        // Scope the extracted elements to the parent (for Alpine reactivity)
        scopeElementsFn(scopables, root);
        
        // Replace unnamed slots with the extracted content
        this.slots.forEach(slot => {
            if (!slot.hasAttribute("name")) {
                slot.replaceWith(...defaultContent, textContent);
            }
        });
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

    getInitRoot() {
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
    const useLightDOM = templateEl.hasAttribute('light');

    if (shouldUnwrap) {
        return new UnwrapStrategy(host, templateEl, styleSheets, Alpine);
    } else if (useLightDOM) {
        return new LightDOMStrategy(host, templateEl, styleSheets, Alpine);
    } else {
        return new ShadowDOMStrategy(host, templateEl, styleSheets, Alpine);
    }
}


export { BaseDOMStrategy, ShadowDOMStrategy, LightDOMStrategy, UnwrapStrategy };