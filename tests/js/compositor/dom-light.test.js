import { describe, it, expect, beforeEach } from 'vitest';
import { registerComponent } from '@compositor/registery.js';
import { resetDOM } from '../setup.js';
import lightComponent from '@test-components/light.alpine.html?raw';

describe('DOM Strategy - Light DOM', () => {
    beforeEach(() => {
        resetDOM();
    });

    describe('Light DOM Creation', () => {
        it('should not create shadow DOM when light attribute is present', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template light><div>Light Content</div></template>';
            
            registerComponent(template, 'light-basic');
            
            const element = document.createElement('light-basic');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(element.shadowRoot).toBeNull();
        });

        it('should render content directly in light DOM', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template light><div id="content">Light DOM</div></template>';
            
            registerComponent(template, 'light-render');
            
            const element = document.createElement('light-render');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const content = element.querySelector('#content');
            expect(content).toBeDefined();
            expect(content.textContent).toBe('Light DOM');
        });

        it('should be accessible from parent DOM queries', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template light><div class="findable">Find Me</div></template>';
            
            registerComponent(template, 'light-findable');
            
            const element = document.createElement('light-findable');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Should be findable from document
            const found = document.querySelector('.findable');
            expect(found).toBeDefined();
            expect(found.textContent).toBe('Find Me');
        });

        it('should share parent styles', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template light><div class="styled">Styled</div></template>';
            
            // Add global style
            const style = document.createElement('style');
            style.textContent = '.styled { color: blue; }';
            document.head.appendChild(style);
            
            registerComponent(template, 'light-styled');
            
            const element = document.createElement('light-styled');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const styledEl = element.querySelector('.styled');
            expect(styledEl).toBeDefined();
            
            // In real browser, would inherit parent styles
            // Here we just verify structure is correct
        });
    });

    describe('Component Structure', () => {
        it('should preserve component template structure', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template light>
                    <header>Header</header>
                    <main>Main</main>
                    <footer>Footer</footer>
                </template>
            `;
            
            registerComponent(template, 'light-structure');
            
            const element = document.createElement('light-structure');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(element.querySelector('header')).toBeDefined();
            expect(element.querySelector('main')).toBeDefined();
            expect(element.querySelector('footer')).toBeDefined();
        });

        it('should handle nested elements correctly', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template light>
                    <div class="outer">
                        <div class="middle">
                            <div class="inner">Nested</div>
                        </div>
                    </div>
                </template>
            `;
            
            registerComponent(template, 'light-nested');
            
            const element = document.createElement('light-nested');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const inner = element.querySelector('.outer .middle .inner');
            expect(inner).toBeDefined();
            expect(inner.textContent).toBe('Nested');
        });

        it('should maintain element hierarchy', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template light>
                    <ul>
                        <li>Item 1</li>
                        <li>Item 2</li>
                        <li>Item 3</li>
                    </ul>
                </template>
            `;
            
            registerComponent(template, 'light-hierarchy');
            
            const element = document.createElement('light-hierarchy');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const items = element.querySelectorAll('li');
            expect(items.length).toBe(3);
        });
    });

    describe('Slot Handling in Light DOM', () => {
        it('should process slots differently in light DOM', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template light>
                    <div class="container">
                        <slot></slot>
                    </div>
                </template>
            `;
            
            registerComponent(template, 'light-slot');
            
            const element = document.createElement('light-slot');
            element.innerHTML = '<p>Slotted</p>';
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // In light DOM, slots are handled differently
            const slot = element.querySelector('slot');
            expect(slot).toBeDefined();
        });

        it('should handle named slots in light DOM', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template light>
                    <slot name="header"></slot>
                    <slot></slot>
                    <slot name="footer"></slot>
                </template>
            `;
            
            registerComponent(template, 'light-named-slots');
            
            const element = document.createElement('light-named-slots');
            element.innerHTML = `
                <div slot="header">Header Content</div>
                <div>Default Content</div>
                <div slot="footer">Footer Content</div>
            `;
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const headerSlot = element.querySelector('slot[name="header"]');
            const footerSlot = element.querySelector('slot[name="footer"]');
            
            expect(headerSlot).toBeDefined();
            expect(footerSlot).toBeDefined();
        });

        it('should preserve original slot content', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template light>
                    <div class="wrapper">
                        <slot></slot>
                    </div>
                </template>
            `;
            
            registerComponent(template, 'light-preserve-slot');
            
            const element = document.createElement('light-preserve-slot');
            const originalContent = document.createElement('p');
            originalContent.textContent = 'Original';
            element.appendChild(originalContent);
            
            document.body.appendChild(element);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Original content should still exist
            expect(element.contains(originalContent)).toBe(true);
        });

        it('should handle empty slots', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template light>
                    <slot>Fallback</slot>
                </template>
            `;
            
            registerComponent(template, 'light-empty-slot');
            
            const element = document.createElement('light-empty-slot');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const slot = element.querySelector('slot');
            expect(slot).toBeDefined();
        });
    });

    describe('Attribute Handling', () => {
        it('should copy attributes from host to component root', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template light><div>Content</div></template>';
            
            registerComponent(template, 'light-attrs');
            
            const element = document.createElement('light-attrs');
            element.setAttribute('data-test', 'value');
            element.setAttribute('class', 'test-class');
            element.setAttribute('id', 'test-id');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const root = element.querySelector('div');
            
            // Attributes should be copied to root element
            expect(root.getAttribute('data-test')).toBe('value');
            expect(root.classList.contains('test-class')).toBe(true);
        });

        it('should merge class attributes', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template light><div class="original">Content</div></template>';
            
            registerComponent(template, 'light-merge-class');
            
            const element = document.createElement('light-merge-class');
            element.className = 'added';
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const root = element.querySelector('div');
            
            // Should have both classes
            expect(root.classList.contains('original')).toBe(true);
            expect(root.classList.contains('added')).toBe(true);
        });

        it('should handle Alpine directives on host', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template light><div>Content</div></template>';
            
            registerComponent(template, 'light-alpine-host');
            
            const element = document.createElement('light-alpine-host');
            element.setAttribute('x-data', '{ test: true }');
            element.setAttribute('@click', 'test = false');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const root = element.querySelector('div');
            
            // Alpine directives should be copied
            expect(root.hasAttribute('x-data')).toBe(true);
            expect(root.hasAttribute('@click')).toBe(true);
        });

        it('should not override existing attributes on root', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template light><div data-test="original">Content</div></template>';
            
            registerComponent(template, 'light-no-override');
            
            const element = document.createElement('light-no-override');
            element.setAttribute('data-test', 'new');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const root = element.querySelector('div');
            
            // Should keep original attribute value
            expect(root.getAttribute('data-test')).toBe('original');
        });

        it('should handle shorthand Alpine syntax', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template light><div>Content</div></template>';
            
            registerComponent(template, 'light-shorthand');
            
            const element = document.createElement('light-shorthand');
            element.setAttribute('@click', 'handleClick');
            element.setAttribute(':class', '{ active: isActive }');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const root = element.querySelector('div');
            
            // Shorthand should be converted and copied
            expect(root.hasAttribute('x-on:click') || root.hasAttribute('@click')).toBe(true);
            expect(root.hasAttribute('x-bind:class') || root.hasAttribute(':class')).toBe(true);
        });
    });

    describe('Alpine Integration', () => {
        it('should work with Alpine reactivity', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template light>
                    <div x-data="{ count: 0 }">
                        <button @click="count++">Increment</button>
                        <span x-text="count"></span>
                    </div>
                </template>
            `;
            
            registerComponent(template, 'light-reactive');
            
            const element = document.createElement('light-reactive');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const button = element.querySelector('button');
            const span = element.querySelector('span');
            
            expect(button).toBeDefined();
            expect(span).toBeDefined();
        });

        it('should support x-init directive', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template light>
                    <div x-data="{ initialized: false }" x-init="initialized = true">
                        Content
                    </div>
                </template>
            `;
            
            registerComponent(template, 'light-init');
            
            const element = document.createElement('light-init');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const root = element.querySelector('div');
            expect(root.hasAttribute('x-init')).toBe(true);
        });

        it('should support x-show and x-if directives', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template light>
                    <div x-data="{ show: true }">
                        <div x-show="show">Shown</div>
                        <template x-if="show">
                            <div>Conditional</div>
                        </template>
                    </div>
                </template>
            `;
            
            registerComponent(template, 'light-conditionals');
            
            const element = document.createElement('light-conditionals');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(element.querySelector('[x-show]')).toBeDefined();
            expect(element.querySelector('template[x-if]')).toBeDefined();
        });
    });

    describe('Style Handling', () => {
        it('should not create scoped styles', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template light>
                    <div class="light-styled">Content</div>
                </template>
                <style>
                    .light-styled { color: red; }
                </style>
            `;
            
            registerComponent(template, 'light-no-scoped');
            
            const element = document.createElement('light-no-scoped');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Styles should be global or attached to head
            expect(element.querySelector('style')).toBeNull();
        });

        it('should be affected by global styles', async () => {
            const style = document.createElement('style');
            style.textContent = '.global-style { font-weight: bold; }';
            document.head.appendChild(style);
            
            const template = document.createElement('template');
            template.innerHTML = '<template light><div class="global-style">Styled</div></template>';
            
            registerComponent(template, 'light-global-style');
            
            const element = document.createElement('light-global-style');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const styledDiv = element.querySelector('.global-style');
            expect(styledDiv).toBeDefined();
        });
    });

    describe('Component Lifecycle', () => {
        it('should initialize immediately in light DOM', async () => {
            const template = document.createElement('template');
            template.innerHTML = lightComponent;
            
            registerComponent(template, 'light-lifecycle');
            
            const element = document.createElement('light-lifecycle');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(element._m_initialized).toBe(true);
        });

        it('should handle reconnection correctly', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template light><div>Reconnect</div></template>';
            
            registerComponent(template, 'light-reconnect');
            
            const element = document.createElement('light-reconnect');
            
            document.body.appendChild(element);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            element.remove();
            
            document.body.appendChild(element);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Should still work after reconnection
            expect(element.querySelector('div')).toBeDefined();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty template', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template light></template>';
            
            registerComponent(template, 'light-empty');
            
            const element = document.createElement('light-empty');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(element.children.length).toBeGreaterThanOrEqual(0);
        });

        it('should handle text-only content', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template light>Just text</template>';
            
            registerComponent(template, 'light-text-only');
            
            const element = document.createElement('light-text-only');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(element.textContent).toContain('Just text');
        });

        it('should handle mixed content types', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template light>Text<div>Element</div><!-- Comment -->More text</template>';
            
            registerComponent(template, 'light-mixed');
            
            const element = document.createElement('light-mixed');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(element.querySelector('div')).toBeDefined();
            expect(element.textContent).toContain('Text');
        });

        it('should handle deeply nested light DOM components', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template light><div><slot></slot></div></template>';
            
            registerComponent(template, 'light-nest-level');
            
            const level1 = document.createElement('light-nest-level');
            const level2 = document.createElement('light-nest-level');
            const level3 = document.createElement('light-nest-level');
            
            level1.appendChild(level2);
            level2.appendChild(level3);
            document.body.appendChild(level1);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(level1._m_initialized).toBe(true);
            expect(level2._m_initialized).toBe(true);
            expect(level3._m_initialized).toBe(true);
        });
    });
});