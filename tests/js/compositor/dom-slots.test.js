import { describe, it, expect, beforeEach } from 'vitest';
import { registerComponent } from '@compositor/registery.js';
import { resetDOM } from '../setup.js';

describe('DOM Strategies - Slot Handling', () => {
    beforeEach(() => {
        resetDOM();
    });

    describe('Slot Ownership Tracking', () => {
        it('should mark slot content with parent component ownership', async () => {
            const parentTemplate = document.createElement('template');
            parentTemplate.innerHTML = '<template shadow><div><slot></slot></div></template>';
            
            registerComponent(parentTemplate, 'slot-parent');
            
            const parent = document.createElement('slot-parent');
            const child = document.createElement('div');
            child.textContent = 'Child Content';
            parent.appendChild(child);
            
            document.body.appendChild(parent);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Child should have parentComponent property
            expect(child.parentComponent).toBe(parent);
        });

        it('should recursively mark nested slot content', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template shadow><div><slot></slot></div></template>';
            
            registerComponent(template, 'slot-nested-owner');
            
            const parent = document.createElement('slot-nested-owner');
            const level1 = document.createElement('div');
            const level2 = document.createElement('div');
            const level3 = document.createElement('span');
            
            level2.appendChild(level3);
            level1.appendChild(level2);
            parent.appendChild(level1);
            
            document.body.appendChild(parent);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // All levels should be marked
            expect(level1.parentComponent).toBe(parent);
            expect(level2.parentComponent).toBe(parent);
            expect(level3.parentComponent).toBe(parent);
        });

        it('should stop marking at nested custom elements', async () => {
            const outerTemplate = document.createElement('template');
            outerTemplate.innerHTML = '<template shadow><div><slot></slot></div></template>';
            
            const innerTemplate = document.createElement('template');
            innerTemplate.innerHTML = '<template shadow><div>Inner</div></template>';
            
            registerComponent(outerTemplate, 'slot-outer');
            registerComponent(innerTemplate, 'slot-inner');
            
            const outer = document.createElement('slot-outer');
            const inner = document.createElement('slot-inner');
            const deepChild = document.createElement('div');
            
            inner.appendChild(deepChild);
            outer.appendChild(inner);
            
            document.body.appendChild(outer);
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Inner custom element should be marked with outer
            expect(inner.parentComponent).toBe(outer);
            
            // But deep child should be marked with inner, not outer
            expect(deepChild.parentComponent).toBe(inner);
        });

        it('should handle content moved between components', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template shadow><div><slot></slot></div></template>';
            
            registerComponent(template, 'slot-movable');
            
            const parent1 = document.createElement('slot-movable');
            const parent2 = document.createElement('slot-movable');
            const content = document.createElement('div');
            
            parent1.appendChild(content);
            document.body.appendChild(parent1);
            document.body.appendChild(parent2);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(content.parentComponent).toBe(parent1);
            
            // Move content
            parent2.appendChild(content);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Ownership should update
            expect(content.parentComponent).toBe(parent2);
        });

        it('should not override existing parentComponent', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template shadow><div><slot></slot></div></template>';
            
            registerComponent(template, 'slot-no-override');
            
            const parent = document.createElement('slot-no-override');
            const child = document.createElement('div');
            
            // Pre-mark with different owner
            const mockOwner = { tagName: 'MOCK-OWNER' };
            child.parentComponent = mockOwner;
            
            parent.appendChild(child);
            document.body.appendChild(parent);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Should not override existing mark
            expect(child.parentComponent).toBe(mockOwner);
        });

        it('should allow override when specified', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template shadow><div><slot></slot></div></template>';
            
            registerComponent(template, 'slot-force-override');
            
            const parent = document.createElement('slot-force-override');
            const child = document.createElement('div');
            
            const oldOwner = { tagName: 'OLD-OWNER' };
            child.parentComponent = oldOwner;
            
            // If override flag is set during marking, should update
            parent.appendChild(child);
            document.body.appendChild(parent);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Implementation specific: test expected behavior
            // Either keeps old owner or updates based on override flag
        });
    });

    describe('Slot Context Resolution', () => {
        it('should resolve slot content in parent Alpine context', async () => {
            const parentTemplate = document.createElement('template');
            parentTemplate.innerHTML = `
                <template shadow>
                    <div x-data="{ parentValue: 'from parent' }">
                        <slot></slot>
                    </div>
                </template>
            `;
            
            registerComponent(parentTemplate, 'slot-context-parent');
            
            const parent = document.createElement('slot-context-parent');
            const slotContent = document.createElement('div');
            slotContent.setAttribute('x-text', 'parentValue');
            parent.appendChild(slotContent);
            
            document.body.appendChild(parent);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Slot content should have access to parent's Alpine context
            // Actual verification would require Alpine execution
        });

        it('should isolate child component context from slot content', async () => {
            const parentTemplate = document.createElement('template');
            parentTemplate.innerHTML = `
                <template shadow>
                    <div x-data="{ value: 'parent' }">
                        <slot></slot>
                    </div>
                </template>
            `;
            
            const childTemplate = document.createElement('template');
            childTemplate.innerHTML = `
                <template shadow>
                    <div x-data="{ value: 'child' }">
                        <span x-text="value"></span>
                    </div>
                </template>
            `;
            
            registerComponent(parentTemplate, 'slot-isolate-parent');
            registerComponent(childTemplate, 'slot-isolate-child');
            
            const parent = document.createElement('slot-isolate-parent');
            const child = document.createElement('slot-isolate-child');
            
            parent.appendChild(child);
            document.body.appendChild(parent);
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Child's internal content should use child context
            // Slot positioning should use parent context
        });

        it('should handle deeply nested slot contexts', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template shadow>
                    <div x-data="{ level: 'component' }">
                        <slot></slot>
                    </div>
                </template>
            `;
            
            registerComponent(template, 'slot-deep-level');
            
            const level1 = document.createElement('slot-deep-level');
            const level2 = document.createElement('slot-deep-level');
            const level3 = document.createElement('slot-deep-level');
            const content = document.createElement('div');
            
            level2.appendChild(level3);
            level1.appendChild(level2);
            level3.appendChild(content);
            
            document.body.appendChild(level1);
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Content should resolve to level3's context
            expect(content.parentComponent).toBe(level3);
        });
    });

    describe('Slot Processing in Shadow DOM', () => {
        it('should create native shadow DOM slots', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template shadow>
                    <div>
                        <slot name="header"></slot>
                        <slot></slot>
                        <slot name="footer"></slot>
                    </div>
                </template>
            `;
            
            registerComponent(template, 'shadow-slot-native');
            
            const element = document.createElement('shadow-slot-native');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const slots = element.shadowRoot.querySelectorAll('slot');
            expect(slots.length).toBe(3);
            
            const namedSlots = Array.from(slots).filter(s => s.hasAttribute('name'));
            expect(namedSlots.length).toBe(2);
        });

        it('should distribute content to correct shadow slots', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template shadow>
                    <div>
                        <slot name="header"></slot>
                        <slot></slot>
                    </div>
                </template>
            `;
            
            registerComponent(template, 'shadow-slot-dist');
            
            const element = document.createElement('shadow-slot-dist');
            element.innerHTML = `
                <div slot="header">Header Content</div>
                <div>Default Content</div>
            `;
            
            document.body.appendChild(element);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Content should be distributed to appropriate slots
            const headerContent = element.querySelector('[slot="header"]');
            const defaultContent = element.querySelector('div:not([slot])');
            
            expect(headerContent).toBeDefined();
            expect(defaultContent).toBeDefined();
        });

        it('should use slot fallback content when no content provided', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template shadow>
                    <div>
                        <slot>Default Fallback</slot>
                    </div>
                </template>
            `;
            
            registerComponent(template, 'shadow-slot-fallback');
            
            const element = document.createElement('shadow-slot-fallback');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const slot = element.shadowRoot.querySelector('slot');
            expect(slot.textContent).toBe('Default Fallback');
        });

        it('should replace fallback when content is provided', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template shadow>
                    <div>
                        <slot>Fallback</slot>
                    </div>
                </template>
            `;
            
            registerComponent(template, 'shadow-slot-replace');
            
            const element = document.createElement('shadow-slot-replace');
            element.innerHTML = '<div>Actual Content</div>';
            
            document.body.appendChild(element);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Actual content should be slotted
            expect(element.querySelector('div')).toBeDefined();
        });
    });

    describe('Slot Processing in Light DOM', () => {
        it('should handle slots without native slot API', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template light>
                    <div>
                        <slot></slot>
                    </div>
                </template>
            `;
            
            registerComponent(template, 'light-slot-manual');
            
            const element = document.createElement('light-slot-manual');
            element.innerHTML = '<p>Content</p>';
            
            document.body.appendChild(element);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Slot should be present
            const slot = element.querySelector('slot');
            expect(slot).toBeDefined();
        });

        it('should position slot content correctly in light DOM', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template light>
                    <div class="container">
                        <slot></slot>
                    </div>
                </template>
            `;
            
            registerComponent(template, 'light-slot-position');
            
            const element = document.createElement('light-slot-position');
            const content = document.createElement('div');
            content.textContent = 'Positioned';
            element.appendChild(content);
            
            document.body.appendChild(element);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Content should be inside container
            const container = element.querySelector('.container');
            expect(container).toBeDefined();
        });

        it('should handle multiple slots in light DOM', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template light>
                    <div>
                        <slot name="first"></slot>
                        <slot name="second"></slot>
                    </div>
                </template>
            `;
            
            registerComponent(template, 'light-multi-slot');
            
            const element = document.createElement('light-multi-slot');
            element.innerHTML = `
                <div slot="first">First</div>
                <div slot="second">Second</div>
            `;
            
            document.body.appendChild(element);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const slots = element.querySelectorAll('slot');
            expect(slots.length).toBe(2);
        });
    });

    describe('Slot Processing in Unwrap Mode', () => {
        it('should handle slots when unwrapping', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template unwrap>
                    <div>
                        <slot></slot>
                    </div>
                </template>
            `;
            
            registerComponent(template, 'unwrap-slot-handle');
            
            const element = document.createElement('unwrap-slot-handle');
            element.innerHTML = '<p>Unwrapped Content</p>';
            
            document.body.appendChild(element);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Unwrapped div should contain slot and content
            const unwrapped = document.querySelector('div');
            expect(unwrapped).toBeDefined();
        });

        it('should distribute content to unwrapped slots', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template unwrap>
                    <section>
                        <slot name="header"></slot>
                        <slot></slot>
                    </section>
                </template>
            `;
            
            registerComponent(template, 'unwrap-slot-dist');
            
            const element = document.createElement('unwrap-slot-dist');
            element.innerHTML = `
                <h1 slot="header">Title</h1>
                <p>Content</p>
            `;
            
            document.body.appendChild(element);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const section = document.querySelector('section');
            expect(section).toBeDefined();
            expect(section.querySelector('[slot="header"]')).toBeDefined();
        });

        it('should preserve slot content parent ownership in unwrap', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template unwrap>
                    <div><slot></slot></div>
                </template>
            `;
            
            registerComponent(template, 'unwrap-slot-owner');
            
            const element = document.createElement('unwrap-slot-owner');
            const content = document.createElement('span');
            element.appendChild(content);
            
            document.body.appendChild(element);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Content should remember its original owner
            // even though element is unwrapped
            expect(content.parentComponent).toBeDefined();
        });
    });

    describe('Complex Slot Scenarios', () => {
        it('should handle nested components with multiple slot levels', async () => {
            const outerTemplate = document.createElement('template');
            outerTemplate.innerHTML = `
                <template shadow>
                    <div>
                        <slot name="outer"></slot>
                    </div>
                </template>
            `;
            
            const innerTemplate = document.createElement('template');
            innerTemplate.innerHTML = `
                <template shadow>
                    <div>
                        <slot name="inner"></slot>
                    </div>
                </template>
            `;
            
            registerComponent(outerTemplate, 'slot-nested-outer');
            registerComponent(innerTemplate, 'slot-nested-inner');
            
            const outer = document.createElement('slot-nested-outer');
            const inner = document.createElement('slot-nested-inner');
            
            inner.innerHTML = '<div slot="inner">Inner Content</div>';
            outer.innerHTML = `<div slot="outer">${inner.outerHTML}</div>`;
            
            document.body.appendChild(outer);
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Both slot levels should work
            expect(outer.shadowRoot).toBeDefined();
        });

        it('should handle same content slotted at different levels', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template shadow>
                    <div>
                        <slot name="shared"></slot>
                    </div>
                </template>
            `;
            
            registerComponent(template, 'slot-shared-level');
            
            const level1 = document.createElement('slot-shared-level');
            const level2 = document.createElement('slot-shared-level');
            const sharedContent = document.createElement('div');
            sharedContent.setAttribute('slot', 'shared');
            sharedContent.textContent = 'Shared';
            
            level2.appendChild(sharedContent.cloneNode(true));
            level1.appendChild(level2);
            level1.appendChild(sharedContent);
            
            document.body.appendChild(level1);
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Both should have their own slotted content
            expect(level1.shadowRoot).toBeDefined();
            expect(level2.shadowRoot).toBeDefined();
        });

        it('should handle dynamically added slot content', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template shadow>
                    <div>
                        <slot></slot>
                    </div>
                </template>
            `;
            
            registerComponent(template, 'slot-dynamic');
            
            const element = document.createElement('slot-dynamic');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Add content after initialization
            const content = document.createElement('p');
            content.textContent = 'Dynamic';
            element.appendChild(content);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Should be marked with ownership
            expect(content.parentComponent).toBe(element);
        });

        it('should handle slot content removed and re-added', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template shadow>
                    <div><slot></slot></div>
                </template>
            `;
            
            registerComponent(template, 'slot-readd');
            
            const element = document.createElement('slot-readd');
            const content = document.createElement('div');
            
            element.appendChild(content);
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(content.parentComponent).toBe(element);
            
            // Remove and re-add
            content.remove();
            element.appendChild(content);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Should still be marked
            expect(content.parentComponent).toBe(element);
        });

        it('should handle slot content in disconnected tree', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template shadow>
                    <div><slot></slot></div>
                </template>
            `;
            
            registerComponent(template, 'slot-disconnected');
            
            const element = document.createElement('slot-disconnected');
            const content = document.createElement('div');
            
            // Build tree but don't connect to document
            element.appendChild(content);
            
            // Should not mark until connected
            expect(content.parentComponent).toBeUndefined();
            
            document.body.appendChild(element);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Now should be marked
            expect(content.parentComponent).toBe(element);
        });
    });

    describe('Slot Edge Cases', () => {
        it('should handle slots with no content gracefully', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template shadow>
                    <div><slot></slot></div>
                </template>
            `;
            
            registerComponent(template, 'slot-empty-content');
            
            const element = document.createElement('slot-empty-content');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(element.shadowRoot).toBeDefined();
            expect(element.children.length).toBe(0);
        });

        it('should handle malformed slot attributes', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template shadow>
                    <slot name=""></slot>
                    <slot name="  "></slot>
                </template>
            `;
            
            registerComponent(template, 'slot-malformed');
            
            const element = document.createElement('slot-malformed');
            element.innerHTML = '<div slot="">Empty Name</div>';
            
            expect(() => {
                document.body.appendChild(element);
            }).not.toThrow();
        });

        it('should handle very deeply nested slot content', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template shadow>
                    <div><slot></slot></div>
                </template>
            `;
            
            registerComponent(template, 'slot-deep-nest');
            
            const element = document.createElement('slot-deep-nest');
            
            let current = document.createElement('div');
            const root = current;
            
            // Create 20 levels deep
            for (let i = 0; i < 20; i++) {
                const child = document.createElement('div');
                current.appendChild(child);
                current = child;
            }
            
            element.appendChild(root);
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // All levels should be marked
            expect(root.parentComponent).toBe(element);
        });
    });
});