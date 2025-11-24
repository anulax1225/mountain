// component-registry.js
// A small, opinionated registry for web component-style Alpine components.
// - Simpler API (register + upgrade)
// - Observes late-added slotted children and initializes Alpine on them
// - Minimal assumptions about Alpine; uses an `initAlpine(node)` adapter


const components = new Map();
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

export function registerComponent(templateEl, name, setupScript, { styleSheets = [], mode = 'shadow' } = {}) {
    if (!name) throw new Error('Component name required');

    components.set(name.toLowerCase(), { templateEl, styleSheets, mode });
}

export function registerStyleSheet(sheet) {
    sheets.push(sheet);
    //console.log("[Alpine Styles] ✓ Registered new style sheet");
}

export function hasComponent(name) {
    return components.has(name);
}

// Attempt to initialize Alpine on a subtree. Supports a few Alpine versions.
function initAlpine(node) {
    if (!node) return;
    // try common Alpine entry points. Be tolerant if Alpine isn't available.
    try {
        if (window.Alpine) {
            if (typeof window.Alpine.initTree === 'function') {
                window.Alpine.initTree(node);
                return;
            }
            if (typeof window.Alpine.init === 'function') {
                window.Alpine.init(node);
                return;
            }
            if (typeof window.Alpine.discover === 'function') {
                window.Alpine.discover(node);
                return;
            }
        }
    } catch (e) {
        console.warn('Alpine init failed', e);
    }
}


// Upgrade a single host element (custom tag) into our component instance.
export function upgradeHost(host) {
    const name = host.tagName.toLowerCase();
    const meta = components.get(name);
    if (!meta) return false;


    const { templateEl, styleSheets, mode } = meta;
    // Use a single DOMStrategy class to handle shadow/light/unwrap
    const { DOMStrategy } = awaitGetDOMStrategy();
    const strat = new DOMStrategy(host, templateEl, styleSheets, { mode, initAlpine });
    strat.mount();
    return true;
}


// scan and upgrade all known registered components under root
export function upgradeAll(root = document) {
    for (const name of components.keys()) {
        const nodes = root.querySelectorAll(name);
        nodes.forEach(n => upgradeHost(n));
    }
}


// Helper to lazily import the DOM strategy to avoid circular deps
let cachedDOMStrategyModule = null;
async function awaitGetDOMStrategy() {
    if (cachedDOMStrategyModule) return cachedDOMStrategyModule;
    // The executing environment may not support dynamic import; this keeps compatibility.
    // We assume dom strategy is bundled/available as './dom-strategy.js' next to this file.
    // If bundlers are used, replace with static import.
    cachedDOMStrategyModule = await import('./ddom.js');
    return cachedDOMStrategyModule;
}


// Auto-upgrade on DOMContentLoaded for convenience
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => upgradeAll(document));
} else {
    // page already loaded
    upgradeAll(document);
}