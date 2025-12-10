import Alpine from '../../resources/js/alpinejs';
import { plugin, Compositor } from '../../resources/js/alpine-compositor';
import { vi } from 'vitest';

// Make Alpine and Compositor globally available
global.Alpine = Alpine;
global.Compositor = Compositor;

// Plugin Alpine with compositor
Alpine.plugin(plugin);

// Mock fetch for component loading
global.fetch = vi.fn();

// Helper to reset DOM between tests
export function resetDOM() {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
}

// Helper to create a clean Alpine instance for isolated tests
export function createTestAlpine() {
    // Store original Alpine methods we might want to restore
    const original = {
        start: Alpine.start.bind(Alpine),
        plugin: Alpine.plugin.bind(Alpine),
    };
    
    return { Alpine, original };
}

// Helper to wait for Alpine initialization
export function waitForAlpine(el, timeout = 100) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const check = () => {
            if (el._x_dataStack) {
                resolve(el);
            } else if (Date.now() - start > timeout) {
                reject(new Error('Alpine initialization timeout'));
            } else {
                setTimeout(check, 10);
            }
        };
        check();
    });
}

// Helper to trigger Alpine processing
export function initializeAlpine(el) {
    if (!Alpine.initTree) {
        // Fallback if initTree is not available
        Alpine.start();
    } else {
        Alpine.initTree(el);
    }
}

// Mock MutationObserver for testing
global.MutationObserver = class MockMutationObserver {
    constructor(callback) {
        this.callback = callback;
    }
    observe() {}
    disconnect() {}
    takeRecords() { return []; }
};