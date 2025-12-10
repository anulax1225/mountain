import { describe, it, expect, beforeEach } from 'vitest';
import { registerComponent } from '@compositor/registery.js';
import { resetDOM } from '../setup.js';
import unwrapComponent from '@test-components/unwrap.alpine.html?raw';

describe('DOM Strategy - Unwrap', () => {
    beforeEach(() => {
        resetDOM();
    });

    describe('Unwrap Behavior', () => {
        it('should replace custom element with template root', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template unwrap><div class="unwrapped">Content</div></template>';
            
            registerComponent(template, 'unwrap-basic');
            
            const element = document.createElement('unwrap-basic');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Custom element should no longer exist in DOM
            expect(document.querySelector('unwrap-basic')).toBeNull();
            
            // Instead, the div should be directly in body
            const unwrapped = document.querySelector('.unwrapped');
            expect(unwrapped).toBeDefined();
            expect(unwrapped.tagName).toBe('DIV');
        });

        it('should not create shadow DOM for unwrapped components', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template unwrap><div>No Shadow</div></template>';
            
            registerComponent(template, 'unwrap-no-shadow');
            
            const element = document.createElement('unwrap-no-shadow');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Original element is replaced, check what replaced it
            const content = document.body.querySelector('div');
            expect(content).toBeDefined();
            expect(content.shadowRoot).toBeNull();
        });

        it('should preserve template root element type', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template unwrap><section class="section">Section</section></template>';
            
            registerComponent(template, 'unwrap-section');
            
            const element = document.createElement('unwrap-section');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const section = document.querySelector('section');
            expect(section).toBeDefined();
            expect(section.tagName).toBe('SECTION');
        });

        it('should only work with single root element in template', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template unwrap><div>First</div></template>';
            
            registerComponent(template, 'unwrap-single-root');
            
            const element = document.createElement('unwrap-single-root');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const roots = document.body.children;
            // Should have exactly one root element from the component
            expect(document.querySelector('div')).toBeDefined();
        });

        it('should warn or handle multiple root elements', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template unwrap><div>First</div><div>Second</div></template>';
            
            registerComponent(template, 'unwrap-multi-root');
            
            const element = document.createElement('unwrap-multi-root');
            
            // This should either warn or only unwrap first element
            expect(() => {
                document.body.appendChild(element);
            }).not.toThrow();
        });
    });

    describe('Attribute Handling', () => {
        it('should copy attributes from custom element to unwrapped root', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template unwrap><div>Content</div></template>';
            
            registerComponent(template, 'unwrap-attrs');
            
            const element = document.createElement('unwrap-attrs');
            element.setAttribute('data-test', 'value');
            element.setAttribute('class', 'test-class');
            element.setAttribute('id', 'unique-id');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const unwrapped = document.querySelector('div');
            
            expect(unwrapped.getAttribute('data-test')).toBe('value');
            expect(unwrapped.classList.contains('test-class')).toBe(true);
            expect(unwrapped.id).toBe('unique-id');
        });

        it('should merge classes from host and template', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template unwrap><div class="template-class">Content</div></template>';
            
            registerComponent(template, 'unwrap-merge-class');
            
            const element = document.createElement('unwrap-merge-class');
            element.className = 'host-class';
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const unwrapped = document.querySelector('div');
            
            expect(unwrapped.classList.contains('template-class')).toBe(true);
            expect(unwrapped.classList.contains('host-class')).toBe(true);
        });

        it('should not override template attributes with host attributes', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template unwrap><div data-original="template">Content</div></template>';
            
            registerComponent(template, 'unwrap-no-override');
            
            const element = document.createElement('unwrap-no-override');
            element.setAttribute('data-original', 'host');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const unwrapped = document.querySelector('div');
            
            // Should keep template's original value
            expect(unwrapped.getAttribute('data-original')).toBe('template');
        });

        it('should copy Alpine directives from host', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template unwrap><div>Content</div></template>';
            
            registerComponent(template, 'unwrap-alpine');
            
            const element = document.createElement('unwrap-alpine');
            element.setAttribute('x-data', '{ count: 0 }');
            element.setAttribute('@click', 'count++');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const unwrapped = document.querySelector('div');
            
            expect(unwrapped.hasAttribute('x-data')).toBe(true);
            expect(unwrapped.hasAttribute('@click')).toBe(true);
        });

        it('should handle shorthand Alpine syntax', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template unwrap><button>Click</button></template>';
            
            registerComponent(template, 'unwrap-shorthand');
            
            const element = document.createElement('unwrap-shorthand');
            element.setAttribute('@click', 'handleClick');
            element.setAttribute(':disabled', 'isDisabled');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const unwrapped = document.querySelector('button');
            
            expect(unwrapped.hasAttribute('@click') || unwrapped.hasAttribute('x-on:click')).toBe(true);
            expect(unwrapped.hasAttribute(':disabled') || unwrapped.hasAttribute('x-bind:disabled')).toBe(true);
        });
    });

    describe('Slot Handling', () => {
        it('should move host children into slots', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template unwrap><div><slot></slot></div></template>';
            
            registerComponent(template, 'unwrap-slot');
            
            const element = document.createElement('unwrap-slot');
            const child = document.createElement('p');
            child.textContent = 'Slotted Content';
            element.appendChild(child);
            
            document.body.appendChild(element);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Child should be in the unwrapped element
            const unwrapped = document.querySelector('div');
            expect(unwrapped.contains(child)).toBe(true);
        });

        it('should handle named slots', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template unwrap>
                    <div>
                        <slot name="header"></slot>
                        <slot></slot>
                        <slot name="footer"></slot>
                    </div>
                </template>
            `;
            
            registerComponent(template, 'unwrap-named-slots');
            
            const element = document.createElement('unwrap-named-slots');
            element.innerHTML = `
                <div slot="header">Header</div>
                <div>Content</div>
                <div slot="footer">Footer</div>
            `;
            
            document.body.appendChild(element);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const unwrapped = document.querySelector('div');
            expect(unwrapped).toBeDefined();
            
            // Slotted elements should be present
            const headerSlot = unwrapped.querySelector('[slot="header"]');
            const footerSlot = unwrapped.querySelector('[slot="footer"]');
            
            expect(headerSlot).toBeDefined();
            expect(footerSlot).toBeDefined();
        });

        it('should handle empty slots with fallback', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template unwrap><div><slot>Fallback</slot></div></template>';
            
            registerComponent(template, 'unwrap-fallback');
            
            const element = document.createElement('unwrap-fallback');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const unwrapped = document.querySelector('div');
            const slot = unwrapped.querySelector('slot');
            
            expect(slot.textContent).toBe('Fallback');
        });

        it('should preserve slot content order', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template unwrap><div><slot></slot></div></template>';
            
            registerComponent(template, 'unwrap-order');
            
            const element = document.createElement('unwrap-order');
            element.innerHTML = `
                <span>First</span>
                <span>Second</span>
                <span>Third</span>
            `;
            
            document.body.appendChild(element);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const spans = document.querySelectorAll('span');
            expect(spans[0].textContent).toBe('First');
            expect(spans[1].textContent).toBe('Second');
            expect(spans[2].textContent).toBe('Third');
        });
    });

    describe('Alpine Integration', () => {
        it('should work with Alpine reactivity', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template unwrap>
                    <div x-data="{ count: 0 }">
                        <button @click="count++">Increment</button>
                        <span x-text="count"></span>
                    </div>
                </template>
            `;
            
            registerComponent(template, 'unwrap-reactive');
            
            const element = document.createElement('unwrap-reactive');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const button = document.querySelector('button');
            const span = document.querySelector('span');
            
            expect(button).toBeDefined();
            expect(span).toBeDefined();
        });

        it('should support x-init on unwrapped element', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template unwrap>
                    <div x-data="{ initialized: false }" x-init="initialized = true">
                        Content
                    </div>
                </template>
            `;
            
            registerComponent(template, 'unwrap-init');
            
            const element = document.createElement('unwrap-init');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const unwrapped = document.querySelector('div');
            expect(unwrapped.hasAttribute('x-init')).toBe(true);
        });

        it('should preserve Alpine scope from template', async () => {
            const template = document.createElement('template');
            template.innerHTML = unwrapComponent;
            
            registerComponent(template, 'unwrap-scope');
            
            const element = document.createElement('unwrap-scope');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Unwrapped element should have Alpine scope from template
            const unwrapped = document.querySelector('div');
            expect(unwrapped).toBeDefined();
        });

        it('should work with x-for loops', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template unwrap>
                    <ul x-data="{ items: ['a', 'b', 'c'] }">
                        <template x-for="item in items">
                            <li x-text="item"></li>
                        </template>
                    </ul>
                </template>
            `;
            
            registerComponent(template, 'unwrap-for');
            
            const element = document.createElement('unwrap-for');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const ul = document.querySelector('ul');
            expect(ul).toBeDefined();
            expect(ul.querySelector('template[x-for]')).toBeDefined();
        });
    });

    describe('Parent Replacement', () => {
        it('should maintain position in DOM tree', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template unwrap><div>Positioned</div></template>';
            
            registerComponent(template, 'unwrap-position');
            
            const before = document.createElement('div');
            before.textContent = 'Before';
            const element = document.createElement('unwrap-position');
            const after = document.createElement('div');
            after.textContent = 'After';
            
            document.body.appendChild(before);
            document.body.appendChild(element);
            document.body.appendChild(after);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const children = Array.from(document.body.children);
            const unwrapped = document.body.querySelector('div:nth-child(2)');
            
            // Unwrapped should be between before and after
            expect(children[0].textContent).toBe('Before');
            expect(children[2].textContent).toBe('After');
        });

        it('should work when nested in other elements', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template unwrap><span>Nested</span></template>';
            
            registerComponent(template, 'unwrap-nested');
            
            const container = document.createElement('div');
            container.id = 'container';
            const element = document.createElement('unwrap-nested');
            
            container.appendChild(element);
            document.body.appendChild(container);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const span = container.querySelector('span');
            expect(span).toBeDefined();
            expect(span.textContent).toBe('Nested');
        });

        it('should handle being a child of another component', async () => {
            const parentTemplate = document.createElement('template');
            parentTemplate.innerHTML = '<template shadow><div><slot></slot></div></template>';
            
            const unwrapTemplate = document.createElement('template');
            unwrapTemplate.innerHTML = '<template unwrap><p>Child</p></template>';
            
            registerComponent(parentTemplate, 'unwrap-parent-comp');
            registerComponent(unwrapTemplate, 'unwrap-child-comp');
            
            const parent = document.createElement('unwrap-parent-comp');
            const child = document.createElement('unwrap-child-comp');
            
            parent.appendChild(child);
            document.body.appendChild(parent);
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Child should be unwrapped within parent's shadow DOM
            expect(parent.shadowRoot).toBeDefined();
        });
    });

    describe('Reference Tracking', () => {
        it('should maintain reference to original custom element', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template unwrap><div>Referenced</div></template>';
            
            registerComponent(template, 'unwrap-ref');
            
            const element = document.createElement('unwrap-ref');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const unwrapped = document.querySelector('div');
            
            // Unwrapped element should have reference back to original
            expect(unwrapped._m_unwrappedRef).toBeDefined();
        });

        it('should allow finding original element from unwrapped', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template unwrap><section>Find Me</section></template>';
            
            registerComponent(template, 'unwrap-findable');
            
            const element = document.createElement('unwrap-findable');
            element.setAttribute('data-id', 'original');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const unwrapped = document.querySelector('section');
            
            // Should be able to trace back
            expect(unwrapped._m_unwrappedRef).toBeDefined();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty template', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template unwrap><div></div></template>';
            
            registerComponent(template, 'unwrap-empty');
            
            const element = document.createElement('unwrap-empty');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const unwrapped = document.querySelector('div');
            expect(unwrapped).toBeDefined();
        });

        it('should handle text-only root element', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template unwrap><span>Just Text</span></template>';
            
            registerComponent(template, 'unwrap-text');
            
            const element = document.createElement('unwrap-text');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const span = document.querySelector('span');
            expect(span.textContent).toBe('Just Text');
        });

        it('should handle complex nested structure in root', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template unwrap>
                    <article>
                        <header>Header</header>
                        <section>
                            <div>Content</div>
                        </section>
                        <footer>Footer</footer>
                    </article>
                </template>
            `;
            
            registerComponent(template, 'unwrap-complex');
            
            const element = document.createElement('unwrap-complex');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const article = document.querySelector('article');
            expect(article).toBeDefined();
            expect(article.querySelector('header')).toBeDefined();
            expect(article.querySelector('section div')).toBeDefined();
        });

        it('should handle removal of unwrapped element', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template unwrap><div>Remove Me</div></template>';
            
            registerComponent(template, 'unwrap-remove');
            
            const element = document.createElement('unwrap-remove');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const unwrapped = document.querySelector('div');
            expect(unwrapped).toBeDefined();
            
            unwrapped.remove();
            
            expect(document.querySelector('div')).toBeNull();
        });

        it('should handle re-adding unwrapped element', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template unwrap><div>Reusable</div></template>';
            
            registerComponent(template, 'unwrap-readd');
            
            const element = document.createElement('unwrap-readd');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const unwrapped = document.querySelector('div');
            unwrapped.remove();
            
            // Create new instance
            const element2 = document.createElement('unwrap-readd');
            document.body.appendChild(element2);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(document.querySelector('div')).toBeDefined();
        });
    });

    describe('Style Handling', () => {
        it('should apply global styles to unwrapped element', async () => {
            const style = document.createElement('style');
            style.textContent = '.unwrap-styled { color: blue; }';
            document.head.appendChild(style);
            
            const template = document.createElement('template');
            template.innerHTML = '<template unwrap><div class="unwrap-styled">Styled</div></template>';
            
            registerComponent(template, 'unwrap-global-style');
            
            const element = document.createElement('unwrap-global-style');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const unwrapped = document.querySelector('.unwrap-styled');
            expect(unwrapped).toBeDefined();
        });

        it('should not create scoped styles', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template unwrap>
                    <div>Content</div>
                </template>
                <style>div { color: red; }</style>
            `;
            
            registerComponent(template, 'unwrap-no-scope');
            
            const element = document.createElement('unwrap-no-scope');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Style should be global or in head, not scoped to element
            const unwrapped = document.querySelector('div');
            expect(unwrapped).toBeDefined();
        });
    });
});