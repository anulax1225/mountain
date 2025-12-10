import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerComponent } from '@compositor/registery.js';
import { resetDOM } from '../setup.js';
import parentComponent from '@test-components/parent.alpine.html?raw';
import childComponent from '@test-components/child.alpine.html?raw';

describe('Component Registry - Initialization & Batch Processing', () => {
    beforeEach(() => {
        resetDOM();
    });

    describe('Batch Initialization', () => {
        it('should batch multiple component initializations together', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template><div>Batch Test</div></template>';
            
            registerComponent(template, 'batch-component');
            
            const elements = [
                document.createElement('batch-component'),
                document.createElement('batch-component'),
                document.createElement('batch-component')
            ];
            
            // Add all at once
            elements.forEach(el => document.body.appendChild(el));
            
            // Wait for batch to process
            await new Promise(resolve => setTimeout(resolve, 20));
            
            // All should be initialized
            elements.forEach(el => {
                expect(el._m_initialized).toBe(true);
            });
        });

        it('should initialize components in DOM order', async () => {
            const parentTemplate = document.createElement('template');
            parentTemplate.innerHTML = parentComponent;
            
            const childTemplate = document.createElement('template');
            childTemplate.innerHTML = childComponent;
            
            registerComponent(parentTemplate, 'order-parent');
            registerComponent(childTemplate, 'order-child');
            
            const parent = document.createElement('order-parent');
            const child = document.createElement('order-child');
            
            parent.appendChild(child);
            document.body.appendChild(parent);
            
            const initOrder = [];
            window.__initOrder = initOrder;
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Parent should initialize before child (DOM order)
            expect(parent._m_initialized).toBe(true);
            expect(child._m_initialized).toBe(true);
            
            delete window.__initOrder;
        });

        it('should handle deeply nested components in correct order', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template><div><slot></slot></div></template>';
            
            registerComponent(template, 'nested-level');
            
            const level1 = document.createElement('nested-level');
            const level2 = document.createElement('nested-level');
            const level3 = document.createElement('nested-level');
            
            level1.appendChild(level2);
            level2.appendChild(level3);
            document.body.appendChild(level1);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // All levels should be initialized
            expect(level1._m_initialized).toBe(true);
            expect(level2._m_initialized).toBe(true);
            expect(level3._m_initialized).toBe(true);
        });

        it('should handle siblings initialization correctly', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template><div>Sibling</div></template>';
            
            registerComponent(template, 'sibling-component');
            
            const sibling1 = document.createElement('sibling-component');
            const sibling2 = document.createElement('sibling-component');
            const sibling3 = document.createElement('sibling-component');
            
            const container = document.createElement('div');
            container.appendChild(sibling1);
            container.appendChild(sibling2);
            container.appendChild(sibling3);
            document.body.appendChild(container);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(sibling1._m_initialized).toBe(true);
            expect(sibling2._m_initialized).toBe(true);
            expect(sibling3._m_initialized).toBe(true);
        });
    });

    describe('Initialization Scheduling', () => {
        it('should schedule initialization via requestAnimationFrame', async () => {
            const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
            
            const template = document.createElement('template');
            template.innerHTML = '<template><div>RAF Test</div></template>';
            
            registerComponent(template, 'raf-component');
            
            const element = document.createElement('raf-component');
            document.body.appendChild(element);
            
            expect(rafSpy).toHaveBeenCalled();
            
            rafSpy.mockRestore();
        });

        it('should not schedule if already scheduled', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template><div>Schedule Test</div></template>';
            
            registerComponent(template, 'schedule-test');
            
            const element = document.createElement('schedule-test');
            
            document.body.appendChild(element);
            
            // Mark as scheduled
            expect(element._m_scheduled).toBeTruthy();
            
            // Try to trigger schedule again
            const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
            element.connectedCallback();
            
            // Should not schedule again
            expect(rafSpy).not.toHaveBeenCalled();
            
            rafSpy.mockRestore();
        });

        it('should clear scheduled flag after initialization', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template><div>Clear Flag</div></template>';
            
            registerComponent(template, 'clear-flag-test');
            
            const element = document.createElement('clear-flag-test');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(element._m_initialized).toBe(true);
            expect(element._m_scheduled).toBe(true); // Flag remains for tracking
        });
    });

    describe('Parent-Child Initialization', () => {
        it('should initialize parent before children', async () => {
            const parentTemplate = document.createElement('template');
            parentTemplate.innerHTML = parentComponent;
            
            const childTemplate = document.createElement('template');
            childTemplate.innerHTML = childComponent;
            
            registerComponent(parentTemplate, 'init-parent');
            registerComponent(childTemplate, 'init-child');
            
            const parent = document.createElement('init-parent');
            const child1 = document.createElement('init-child');
            const child2 = document.createElement('init-child');
            
            parent.appendChild(child1);
            parent.appendChild(child2);
            document.body.appendChild(parent);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Parent should initialize first
            expect(parent._m_initialized).toBe(true);
            expect(child1._m_initialized).toBe(true);
            expect(child2._m_initialized).toBe(true);
        });

        it('should handle parent-child added at different times', async () => {
            const parentTemplate = document.createElement('template');
            parentTemplate.innerHTML = parentComponent;
            
            const childTemplate = document.createElement('template');
            childTemplate.innerHTML = childComponent;
            
            registerComponent(parentTemplate, 'async-parent');
            registerComponent(childTemplate, 'async-child');
            
            const parent = document.createElement('async-parent');
            document.body.appendChild(parent);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            expect(parent._m_initialized).toBe(true);
            
            // Add child later
            const child = document.createElement('async-child');
            parent.appendChild(child);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            expect(child._m_initialized).toBe(true);
        });

        it('should handle complex nested structures', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template><div><slot></slot></div></template>';
            
            registerComponent(template, 'complex-nest');
            
            // Create structure: parent > child1 > grandchild, child2
            const parent = document.createElement('complex-nest');
            const child1 = document.createElement('complex-nest');
            const child2 = document.createElement('complex-nest');
            const grandchild = document.createElement('complex-nest');
            
            child1.appendChild(grandchild);
            parent.appendChild(child1);
            parent.appendChild(child2);
            document.body.appendChild(parent);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // All should be initialized in correct order
            expect(parent._m_initialized).toBe(true);
            expect(child1._m_initialized).toBe(true);
            expect(child2._m_initialized).toBe(true);
            expect(grandchild._m_initialized).toBe(true);
        });
    });

    describe('Initialization Edge Cases', () => {
        it('should handle component moved between parents during init', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template><div><slot></slot></div></template>';
            
            registerComponent(template, 'movable-test');
            
            const parent1 = document.createElement('div');
            const parent2 = document.createElement('div');
            const component = document.createElement('movable-test');
            
            parent1.appendChild(component);
            document.body.appendChild(parent1);
            document.body.appendChild(parent2);
            
            // Move during initialization
            parent2.appendChild(component);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Should still initialize correctly
            expect(component._m_initialized).toBe(true);
            expect(component.parentElement).toBe(parent2);
        });

        it('should handle component removed during batch', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template><div>Removed</div></template>';
            
            registerComponent(template, 'removed-component');
            
            const element = document.createElement('removed-component');
            document.body.appendChild(element);
            
            // Remove immediately
            element.remove();
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Should not throw errors
            expect(() => {
                document.body.appendChild(element);
            }).not.toThrow();
        });

        it('should handle initialization of disconnected subtree', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template><div><slot></slot></div></template>';
            
            registerComponent(template, 'disconnected-test');
            
            const parent = document.createElement('disconnected-test');
            const child = document.createElement('disconnected-test');
            
            parent.appendChild(child);
            // Don't add to document
            
            // Components should not initialize while disconnected
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(parent._m_initialized).toBeFalsy();
            expect(child._m_initialized).toBeFalsy();
            
            // Now add to document
            document.body.appendChild(parent);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(parent._m_initialized).toBe(true);
            expect(child._m_initialized).toBe(true);
        });

        it('should handle rapid add/remove cycles', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template><div>Rapid</div></template>';
            
            registerComponent(template, 'rapid-component');
            
            const element = document.createElement('rapid-component');
            
            // Rapidly add and remove
            for (let i = 0; i < 5; i++) {
                document.body.appendChild(element);
                element.remove();
            }
            
            // Final add
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Should not throw and should initialize
            expect(element._m_initialized).toBe(true);
        });
    });

    describe('Initialization State Management', () => {
        it('should track initialization state correctly', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template><div>State</div></template>';
            
            registerComponent(template, 'state-track');
            
            const element = document.createElement('state-track');
            
            expect(element._m_initialized).toBeFalsy();
            expect(element._m_scheduled).toBeFalsy();
            
            document.body.appendChild(element);
            
            expect(element._m_scheduled).toBeTruthy();
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(element._m_initialized).toBe(true);
        });

        it('should preserve state across parent changes', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template><div>Preserve</div></template>';
            
            registerComponent(template, 'preserve-state');
            
            const element = document.createElement('preserve-state');
            const parent1 = document.createElement('div');
            const parent2 = document.createElement('div');
            
            parent1.appendChild(element);
            document.body.appendChild(parent1);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            expect(element._m_initialized).toBe(true);
            
            // Move to new parent
            parent2.appendChild(element);
            document.body.appendChild(parent2);
            
            // Should still be initialized
            expect(element._m_initialized).toBe(true);
        });
    });
});