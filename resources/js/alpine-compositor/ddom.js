// dom-strategy.js
// Single DOM strategy class that supports three modes: 'shadow', 'light', 'unwrap'.
// Responsibilities:
// - instantiate a template for a host
// - hook up styleSheets if provided
// - move / handle slotted nodes and listen for additions
// - ensure newly added slotted nodes are initialized with Alpine via provided adapter


export class DOMStrategy {
    constructor(host, templateEl, styleSheets = [], { mode = 'shadow', initAlpine } = {}) {
        this.host = host;
        this.template = templateEl;
        this.styleSheets = styleSheets;
        this.mode = mode; // 'shadow' | 'light' | 'unwrap'
        this.initAlpine = initAlpine;


        this.root = null; // ShadowRoot or host
        this.slotObservers = new Set();
        this.hostObserver = null;
    }


    mount() {
        this.setupRoot();
        this.instantiateTemplate();
        this.hookSlotBehavior();
        this.observeHostChildren();
        // initialize alpine on content we just added
        this.initAlpine(this.root);
    }


    setupRoot() {
        if (this.mode === 'light') {
            this.root = this.host;
        } else if (this.mode === 'unwrap') {
            // unwrap: replace host with template content (host stays as marker but children moved)
            this.root = this.host; // we'll move nodes into host directly
        } else {
            // default: shadow
            this.root = this.host.attachShadow({ mode: 'open' });
            // apply stylesheets if supported
            if (this.styleSheets && this.styleSheets.length && this.root.adoptedStyleSheets !== undefined) {
                try {
                    this.root.adoptedStyleSheets = [...this.root.adoptedStyleSheets, ...this.styleSheets];
                } catch (e) {
                    // adopt stylesheet might fail in some envs; fallback to <style>
                    this.styleSheets.forEach(ss => {
                        const s = document.createElement('style');
                        s.textContent = ss.cssRules ? Array.from(ss.cssRules).map(r => r.cssText).join('\n') : '';
                        this.root.appendChild(s);
                    });
                }
            }
        }
    }


    instantiateTemplate() {
        const cloned = this.template.content ? this.template.content.cloneNode(true) : this.template.cloneNode(true);
        this.root.appendChild(cloned);
    }


    hookSlotBehavior() {
        // find <slot> elements in our root and listen to slotchange
        const slots = (this.root.querySelectorAll) ? this.root.querySelectorAll('slot') : [];
        slots.forEach(slot => {
            const handler = () => this.onSlotChange(slot);
            slot.addEventListener('slotchange', handler);
            this.slotObservers.add({ slot, handler });
            // run once to initialize currently assigned nodes
            this.onSlotChange(slot);
        });
    }


    onSlotChange(slot) {
        const assigned = slot.assignedElements ? slot.assignedElements({ flatten: true }) : (slot.assignedNodes ? slot.assignedNodes({ flatten: true }).filter(n => n.nodeType === 1) : []);
        assigned.forEach(node => {
            // ensure Alpine initialized on any newly slotted nodes
            this.initAlpine(node);
        });
    }


    observeHostChildren() {
        // Observes nodes added directly under host (useful for light/unwrapped modes)
        this.hostObserver = new MutationObserver(mutations => {
            for (const m of mutations) {
                if (m.type === 'childList' && m.addedNodes && m.addedNodes.length) {
                    m.addedNodes.forEach(n => {
                        if (n.nodeType === 1) this.initAlpine(n);
                    });
                }
            }
        });
        this.hostObserver.observe(this.host, { childList: true, subtree: false });
    }


    destroy() {
        this.slotObservers.forEach(o => o.slot.removeEventListener('slotchange', o.handler));
        this.slotObservers.clear();
        if (this.hostObserver) {
            this.hostObserver.disconnect();
            this.hostObserver = null;
        }
    }
}
export default DOMStrategy;