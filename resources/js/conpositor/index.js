/**
 * Alpine.js Web Component Plugin
 * 
 * Adds x-component directive (shorthand: &) that transforms an element into a Web Component
 * 
 * Usage:
 *   <div x-component="my-custom-element">
 *     <p x-data="{ count: 0 }">
 *       Count: <span x-text="count"></span>
 *       <button @click="count++">Increment</button>
 *     </p>
 *   </div>
 * 
 * After registration, use anywhere:
 *   <my-custom-element></my-custom-element>
 */

export default function (Alpine) {
    // Store registered components to avoid duplicates
    const registeredComponents = new Set();
    console.log(Alpine)
    Alpine.directive('component', (el, { expression }, { cleanup }) => {
        // Get the component name from the expression
        console.log(expression)
        const componentName = expression.trim();
        console.log(componentName);
        if (!componentName) {
            console.error('x-component requires a component name');
            return;
        }

        // Validate component name (must contain a hyphen per Web Components spec)
        if (!componentName.includes('-')) {
            console.error(`Component name "${componentName}" must contain a hyphen`);
            return;
        }

        // Skip if already registered
        if (registeredComponents.has(componentName)) {
            console.warn(`Component "${componentName}" is already registered`);
            return;
        }

        // Clone the template element's content
        const template = el.cloneNode(true);

        // Remove the x-component attribute from the template
        template.removeAttribute('x-component');

        // Create the Web Component class
        class AlpineWebComponent extends HTMLElement {
            constructor() {
                super();

                // Attach shadow DOM (can be changed to this.shadowRoot = null for light DOM)
                //this.attachShadow({ mode: 'open' });
            }

            connectedCallback() {
                // Clone the template content
                const content = template.cloneNode(true);

                // Append to shadow DOM
                this.appendChild(content);

                // Initialize Alpine on the shadow root content
                // We need to wait a tick for the DOM to be ready
                requestAnimationFrame(() => {
                    Alpine.initTree(this.shadowRoot);
                });
            }

            disconnectedCallback() {
                // Cleanup Alpine when component is removed
                if (this.shadowRoot) {
                    Alpine.destroyTree(this.shadowRoot);
                }
            }
        }

        // Register the custom element
        try {
            customElements.define(componentName, AlpineWebComponent);
            registeredComponents.add(componentName);
            console.log(`✓ Web Component "${componentName}" registered successfully`);

            // Hide the original template element
            el.style.display = 'none';

            // Cleanup function
            cleanup(() => {
                // Note: Custom elements cannot be unregistered once defined
                // This is a limitation of the Web Components spec
                console.log(`Cleaning up x-component "${componentName}"`);
            });

        } catch (error) {
            console.error(`Failed to register component "${componentName}":`, error);
        }
    });
}