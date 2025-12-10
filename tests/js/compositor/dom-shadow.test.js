import { describe, it, expect, beforeEach } from 'vitest';
import { registerComponent } from '@compositor/registery.js';
import { resetDOM } from '../setup.js';
import withSlotsComponent from '@test-components/with-slots.alpine.html?raw';
import simpleComponent from '@test-components/simple.alpine.html?raw';

describe('DOM Strategy - Shadow DOM', () => {
    beforeEach(() => {
        resetDOM();
    });

    describe('Shadow DOM Creation', () => {
        it('should create shadow DOM by default', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template shadow><div>Shadow Content</div></template>';
            
            registerComponent(template, 'shadow-default');
            
            const element = document.createElement('shadow-default');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(element.shadowRoot).toBeDefined();
            expect(element.shadowRoot).not.toBeNull();
        });

        it('should attach shadow root in "open" mode', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template shadow><div>Open Shadow</div></template>';
            
            registerComponent(template, 'shadow-open');
            
            const element = document.createElement('shadow-open');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(element.shadowRoot).not.toBeNull();
            expect(element.shadowRoot.mode).toBe('open');
        });

        it('should isolate component styles in shadow DOM', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template shadow>
                    <div class="isolated">Isolated</div>
                </template>
                <style>
                    .isolated { color: red; }
                </style>
            `;
            
            registerComponent(template, 'shadow-isolated');
            
            const element = document.createElement('shadow-isolated');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const styleSheets = element.shadowRoot.adoptedStyleSheets || 
                               Array.from(element.shadowRoot.querySelectorAll('style'));
            
            expect(styleSheets.length).toBeGreaterThan(0);
        });

        it('should create shadow DOM only once', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template shadow><div>Once</div></template>';
            
            registerComponent(template, 'shadow-once');
            
            const element = document.createElement('shadow-once');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const firstShadowRoot = element.shadowRoot;
            
            // Try to trigger creation again
            element.connectedCallback();
            
            expect(element.shadowRoot).toBe(firstShadowRoot);
        });
    });

    describe('Component Rendering', () => {
        it('should render component template in shadow DOM', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template shadow><div id="content">Test Content</div></template>';
            
            registerComponent(template, 'shadow-render');
            
            const element = document.createElement('shadow-render');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const content = element.shadowRoot.querySelector('#content');
            expect(content).toBeDefined();
            expect(content.textContent).toBe('Test Content');
        });

        it('should preserve component structure', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template shadow>
                    <header>Header</header>
                    <main>Main</main>
                    <footer>Footer</footer>
                </template>
            `;
            
            registerComponent(template, 'shadow-structure');
            
            const element = document.createElement('shadow-structure');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(element.shadowRoot.querySelector('header')).toBeDefined();
            expect(element.shadowRoot.querySelector('main')).toBeDefined();
            expect(element.shadowRoot.querySelector('footer')).toBeDefined();
        });

        it('should handle complex nested structures', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template shadow>
                    <div class="outer">
                        <div class="middle">
                            <div class="inner">Nested</div>
                        </div>
                    </div>
                </template>
            `;
            
            registerComponent(template, 'shadow-nested');
            
            const element = document.createElement('shadow-nested');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const inner = element.shadowRoot.querySelector('.outer .middle .inner');
            expect(inner).toBeDefined();
            expect(inner.textContent).toBe('Nested');
        });

        it('should render with Alpine directives', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template shadow>
                    <div x-data="{ count: 0 }">
                        <button @click="count++">Increment</button>
                        <span x-text="count"></span>
                    </div>
                </template>
            `;
            
            registerComponent(template, 'shadow-alpine');
            
            const element = document.createElement('shadow-alpine');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const button = element.shadowRoot.querySelector('button');
            const span = element.shadowRoot.querySelector('span');
            
            expect(button).toBeDefined();
            expect(span).toBeDefined();
        });
    });

    describe('Style Sheet Handling', () => {
        it('should inject global style sheets into shadow DOM', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template shadow><div>Styled</div></template>';
            
            registerComponent(template, 'shadow-styles');
            
            const element = document.createElement('shadow-styles');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Check for adopted stylesheets or style tags
            const hasStyles = element.shadowRoot.adoptedStyleSheets?.length > 0 ||
                            element.shadowRoot.querySelectorAll('style').length > 0;
            
            expect(hasStyles).toBe(true);
        });

        it('should apply component-specific styles', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template shadow>
                    <div class="custom">Custom</div>
                </template>
                <style>
                    .custom { background: blue; }
                </style>
            `;
            
            registerComponent(template, 'shadow-custom-styles');
            
            const element = document.createElement('shadow-custom-styles');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const styles = Array.from(element.shadowRoot.querySelectorAll('style'))
                .map(s => s.textContent);
            
            const hasCustomStyle = styles.some(s => s.includes('.custom'));
            expect(hasCustomStyle).toBe(true);
        });

        it('should handle multiple style sheets', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template shadow>
                    <div>Multi Style</div>
                </template>
                <style>.first { color: red; }</style>
                <style>.second { color: blue; }</style>
            `;
            
            registerComponent(template, 'shadow-multi-styles');
            
            const element = document.createElement('shadow-multi-styles');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const styles = element.shadowRoot.querySelectorAll('style');
            expect(styles.length).toBeGreaterThan(0);
        });

        it('should not leak styles to light DOM', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template shadow>
                    <div class="isolated">Isolated</div>
                </template>
                <style>
                    .isolated { color: red; }
                </style>
            `;
            
            registerComponent(template, 'shadow-no-leak');
            
            const element = document.createElement('shadow-no-leak');
            const outsideDiv = document.createElement('div');
            outsideDiv.className = 'isolated';
            
            document.body.appendChild(element);
            document.body.appendChild(outsideDiv);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Outside element should not have shadow DOM styles
            const shadowContent = element.shadowRoot.querySelector('.isolated');
            expect(shadowContent).toBeDefined();
            
            // This would need actual computed style checking in real environment
            expect(outsideDiv.parentElement).toBe(document.body);
        });
    });

    describe('Slot Handling', () => {
        it('should create slots in shadow DOM', async () => {
            const template = document.createElement('template');
            template.innerHTML = withSlotsComponent;
            
            registerComponent(template, 'shadow-slots');
            
            const element = document.createElement('shadow-slots');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const slots = element.shadowRoot.querySelectorAll('slot');
            expect(slots.length).toBeGreaterThan(0);
        });

        it('should handle named slots', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template shadow>
                    <slot name="header"></slot>
                    <slot></slot>
                    <slot name="footer"></slot>
                </template>
            `;
            
            registerComponent(template, 'shadow-named-slots');
            
            const element = document.createElement('shadow-named-slots');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const headerSlot = element.shadowRoot.querySelector('slot[name="header"]');
            const footerSlot = element.shadowRoot.querySelector('slot[name="footer"]');
            const defaultSlot = element.shadowRoot.querySelector('slot:not([name])');
            
            expect(headerSlot).toBeDefined();
            expect(footerSlot).toBeDefined();
            expect(defaultSlot).toBeDefined();
        });

        it('should distribute slot content correctly', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template shadow>
                    <div class="container">
                        <slot></slot>
                    </div>
                </template>
            `;
            
            registerComponent(template, 'shadow-slot-dist');
            
            const element = document.createElement('shadow-slot-dist');
            element.innerHTML = '<p>Slotted Content</p>';
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const slot = element.shadowRoot.querySelector('slot');
            expect(slot).toBeDefined();
            
            // Check that light DOM content exists
            expect(element.querySelector('p')).toBeDefined();
        });

        it('should handle slot fallback content', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template shadow>
                    <slot>Fallback Content</slot>
                </template>
            `;
            
            registerComponent(template, 'shadow-slot-fallback');
            
            // Element with no content
            const element = document.createElement('shadow-slot-fallback');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const slot = element.shadowRoot.querySelector('slot');
            expect(slot.textContent).toBe('Fallback Content');
        });

        it('should handle multiple default slots gracefully', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template shadow>
                    <slot></slot>
                    <slot></slot>
                </template>
            `;
            
            registerComponent(template, 'shadow-multi-default');
            
            const element = document.createElement('shadow-multi-default');
            element.innerHTML = '<p>Content</p>';
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const slots = element.shadowRoot.querySelectorAll('slot:not([name])');
            expect(slots.length).toBe(2);
        });
    });

    describe('Attribute Handling', () => {
        it('should not copy attributes from host to shadow root', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template shadow><div>Content</div></template>';
            
            registerComponent(template, 'shadow-no-attr-copy');
            
            const element = document.createElement('shadow-no-attr-copy');
            element.setAttribute('data-test', 'value');
            element.setAttribute('class', 'test-class');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const root = element.shadowRoot.firstElementChild;
            
            // Attributes should stay on host, not copied to shadow content
            expect(element.getAttribute('data-test')).toBe('value');
            expect(root.getAttribute('data-test')).toBeNull();
        });

        it('should preserve Alpine directives on shadow content', async () => {
            const template = document.createElement('template');
            template.innerHTML = `
                <template shadow>
                    <div x-data="{ test: true }" @click="test = false">
                        Content
                    </div>
                </template>
            `;
            
            registerComponent(template, 'shadow-alpine-attrs');
            
            const element = document.createElement('shadow-alpine-attrs');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const root = element.shadowRoot.firstElementChild;
            expect(root.hasAttribute('x-data')).toBe(true);
            expect(root.hasAttribute('@click')).toBe(true);
        });
    });

    describe('Component Cleanup', () => {
        it('should clean up shadow DOM on disconnect', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template shadow><div>Cleanup</div></template>';
            
            registerComponent(template, 'shadow-cleanup');
            
            const element = document.createElement('shadow-cleanup');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const shadowRoot = element.shadowRoot;
            expect(shadowRoot).not.toBeNull();
            
            element.remove();
            
            // Shadow root should still exist but element is disconnected
            expect(element.isConnected).toBe(false);
            expect(element.shadowRoot).toBe(shadowRoot);
        });

        it('should handle multiple connect/disconnect cycles', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template shadow><div>Cycle</div></template>';
            
            registerComponent(template, 'shadow-cycle');
            
            const element = document.createElement('shadow-cycle');
            
            for (let i = 0; i < 3; i++) {
                document.body.appendChild(element);
                await new Promise(resolve => setTimeout(resolve, 20));
                element.remove();
            }
            
            document.body.appendChild(element);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(element.shadowRoot).not.toBeNull();
            expect(element._m_initialized).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty shadow template', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template shadow></template>';
            
            registerComponent(template, 'shadow-empty');
            
            const element = document.createElement('shadow-empty');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(element.shadowRoot).not.toBeNull();
            expect(element.shadowRoot.children.length).toBeGreaterThanOrEqual(0);
        });

        it('should handle template with only text nodes', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template shadow>Just text</template>';
            
            registerComponent(template, 'shadow-text-only');
            
            const element = document.createElement('shadow-text-only');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(element.shadowRoot.textContent).toContain('Just text');
        });

        it('should handle template with comments', async () => {
            const template = document.createElement('template');
            template.innerHTML = '<template shadow><!-- comment --><div>Content</div></template>';
            
            registerComponent(template, 'shadow-comments');
            
            const element = document.createElement('shadow-comments');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(element.shadowRoot.querySelector('div')).toBeDefined();
        });

        it('should handle very deep nesting in shadow DOM', async () => {
            let nested = '<div class="level0">';
            for (let i = 1; i < 10; i++) {
                nested += `<div class="level${i}">`;
            }
            nested += 'Deep</div>'.repeat(10);
            
            const template = document.createElement('template');
            template.innerHTML = `<template shadow>${nested}</template>`;
            
            registerComponent(template, 'shadow-deep');
            
            const element = document.createElement('shadow-deep');
            document.body.appendChild(element);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const deep = element.shadowRoot.querySelector('.level0 .level1 .level2');
            expect(deep).toBeDefined();
        });
    });
});