import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { registerComponent, hasComponent } from '@compositor/registery.js';
import { resetDOM } from '../setup.js';
import simpleComponent from '@test-components/simple.alpine.html?raw';
import withSlotsComponent from '@test-components/with-slots.alpine.html?raw';

describe('Component Registry - Core Functionality', () => {
    beforeEach(() => {
        resetDOM();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Component Registration', () => {
        it('should register a valid component with hyphenated name', () => {
            const template = document.createElement('template');
            template.innerHTML = simpleComponent;
            
            expect(() => {
                registerComponent(template, 'test-component');
            }).not.toThrow();
            
            expect(hasComponent('test-component')).toBe(true);
        });

        it('should register component as a custom element', () => {
            const template = document.createElement('template');
            template.innerHTML = simpleComponent;
            
            registerComponent(template, 'custom-element');
            
            expect(customElements.get('custom-element')).toBeDefined();
        });

        it('should create component instances that can be instantiated', () => {
            const template = document.createElement('template');
            template.innerHTML = simpleComponent;
            
            registerComponent(template, 'instance-test');
            
            const instance = document.createElement('instance-test');
            expect(instance).toBeInstanceOf(HTMLElement);
            expect(instance.tagName.toLowerCase()).toBe('instance-test');
        });

        it('should extract and execute setup script from component', () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template>
                    <div>Component</div>
                </template>
                <script setup>
                    return { testValue: 42 };
                </script>
            `;
            
            registerComponent(template, 'script-test');
            const element = document.createElement('script-test');
            document.body.appendChild(element);
            
            expect(element._x_dataStack).toBeDefined();
        });

        it('should handle component without setup script', () => {
            const template = document.createElement('template');
            template.innerHTML = `<template><div>No Script</div></template>`;
            
            expect(() => {
                registerComponent(template, 'no-script');
            }).not.toThrow();
            
            expect(hasComponent('no-script')).toBe(true);
        });

        it('should support multiple independent component registrations', () => {
            const template1 = document.createElement('template');
            template1.innerHTML = simpleComponent;
            
            const template2 = document.createElement('template');
            template2.innerHTML = withSlotsComponent;
            
            registerComponent(template1, 'component-one');
            registerComponent(template2, 'component-two');
            
            expect(hasComponent('component-one')).toBe(true);
            expect(hasComponent('component-two')).toBe(true);
            expect(customElements.get('component-one')).not.toBe(customElements.get('component-two'));
        });
    });

    describe('Component Name Validation', () => {
        it('should reject component names without hyphens', () => {
            const template = document.createElement('template');
            template.innerHTML = simpleComponent;
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            
            registerComponent(template, 'invalidname');
            
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('must contain a hyphen')
            );
            expect(hasComponent('invalidname')).toBe(false);
            
            consoleSpy.mockRestore();
        });

        it('should reject undefined or null component names', () => {
            const template = document.createElement('template');
            template.innerHTML = simpleComponent;
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            
            registerComponent(template, null);
            registerComponent(template, undefined);
            
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('name is required')
            );
            
            consoleSpy.mockRestore();
        });

        it('should reject empty string as component name', () => {
            const template = document.createElement('template');
            template.innerHTML = simpleComponent;
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            
            registerComponent(template, '');
            
            expect(consoleSpy).toHaveBeenCalled();
            
            consoleSpy.mockRestore();
        });

        it('should accept names with multiple hyphens', () => {
            const template = document.createElement('template');
            template.innerHTML = simpleComponent;
            
            registerComponent(template, 'multi-hyphen-component-name');
            
            expect(hasComponent('multi-hyphen-component-name')).toBe(true);
        });

        it('should handle names with numbers and hyphens', () => {
            const template = document.createElement('template');
            template.innerHTML = simpleComponent;
            
            registerComponent(template, 'component-v2');
            
            expect(hasComponent('component-v2')).toBe(true);
        });
    });

    describe('Duplicate Registration Handling', () => {
        it('should warn when registering the same component name twice', () => {
            const template = document.createElement('template');
            template.innerHTML = simpleComponent;
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            
            registerComponent(template, 'duplicate-test');
            registerComponent(template, 'duplicate-test');
            
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('already registered')
            );
            
            consoleSpy.mockRestore();
        });

        it('should not register a component if custom element already exists', () => {
            const template = document.createElement('template');
            template.innerHTML = simpleComponent;
            
            registerComponent(template, 'existing-element');
            
            const originalElement = customElements.get('existing-element');
            
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            registerComponent(template, 'existing-element');
            
            expect(customElements.get('existing-element')).toBe(originalElement);
            expect(consoleSpy).toHaveBeenCalled();
            
            consoleSpy.mockRestore();
        });

        it('should maintain component integrity after duplicate attempt', () => {
            const template1 = document.createElement('template');
            template1.innerHTML = '<template><div>First</div></template>';
            
            const template2 = document.createElement('template');
            template2.innerHTML = '<template><div>Second</div></template>';
            
            registerComponent(template1, 'integrity-test');
            vi.spyOn(console, 'warn').mockImplementation(() => {});
            registerComponent(template2, 'integrity-test');
            
            const element = document.createElement('integrity-test');
            document.body.appendChild(element);
            
            const content = element.shadowRoot?.textContent || element.textContent;
            expect(content).toContain('First');
        });
    });

    describe('Component Lifecycle', () => {
        it('should initialize component when added to DOM', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template>
                    <div>Component</div>
                </template>
                <script setup>
                    return {
                        initialized: false,
                        init() {
                            this.initialized = true;
                        }
                    };
                </script>
            `;
            
            registerComponent(template, 'lifecycle-test');
            const element = document.createElement('lifecycle-test');
            
            expect(element._m_initialized).toBeFalsy();
            
            document.body.appendChild(element);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(element._m_initialized).toBe(true);
        });

        it('should not double-initialize if already initialized', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template><div>Test</div></template>
                <script setup>
                    return {
                        init() {
                            window.__initCount = (window.__initCount || 0) + 1;
                        }
                    };
                </script>
            `;
            
            registerComponent(template, 'double-init-test');
            const element = document.createElement('double-init-test');
            
            document.body.appendChild(element);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            element.connectedCallback();
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(window.__initCount).toBe(1);
            delete window.__initCount;
        });

        it('should cleanup component when removed from DOM', async () => {
            const template = document.createElement('template');
            template.innerHTML = `<template><div>Component</div></template>`;
            
            registerComponent(template, 'cleanup-test');
            const element = document.createElement('cleanup-test');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const wasInitialized = element._m_initialized;
            expect(wasInitialized).toBe(true);
            
            element.remove();
            
            expect(() => element.remove()).not.toThrow();
        });
    });

    describe('hasComponent Utility', () => {
        it('should return false for unregistered component', () => {
            expect(hasComponent('non-existent-component')).toBe(false);
        });

        it('should return true for registered component', () => {
            const template = document.createElement('template');
            template.innerHTML = simpleComponent;
            
            registerComponent(template, 'check-test');
            
            expect(hasComponent('check-test')).toBe(true);
        });

        it('should handle checking multiple components', () => {
            const template = document.createElement('template');
            template.innerHTML = simpleComponent;
            
            registerComponent(template, 'component-a');
            registerComponent(template, 'component-b');
            
            expect(hasComponent('component-a')).toBe(true);
            expect(hasComponent('component-b')).toBe(true);
            expect(hasComponent('component-c')).toBe(false);
        });
    });
});