import { createComponentElement, getUndefinedCustomElements } from "./importer.js"

export class ComponentNamespace {
    constructor(config) {
        this.uri = !!config.uri ? (config.uri.at(-1) === "/" ? config.uri : config.uri + "/") : '';
        this.prefix = config.prefix || '';
        this.transform = config.transform || ((name) => `${name}.alpine.html`);
        this.cache = new Map();
        this.autoImport = config.autoImport !== undefined ? config.autoImport : true;
    }
    
    resolve(componentName) {
        const fileName = this.transform(componentName);
        return `${this.uri}${fileName}`;
    }
    
    async fetch(componentName) {
        if (this.cache.has(componentName)) {
            return this.cache.get(componentName);
        }
        
        const uri = this.resolve(componentName);
        const response = await fetch(uri);
        const html = await response.text();
        
        this.cache.set(componentName, html);
        return html;
    }
    
    matches(tagName) {
        const [namespace] = tagName.split('-');
        return namespace === this.prefix;
    }
    
    extractName(tagName) {
        const parts = tagName.split('-');
        parts.shift();
        return parts.join('-');
    }

    register(componentName, htmlContent) {
        return createComponentElement(componentName, htmlContent, this.prefix);
    }
    
    async load(tagName, registry) {
        const componentName = this.extractName(tagName);
        const html = await this.fetch(componentName);
        const template = this.register(componentName, html);
        if (this.autoImport) {
            await registry.findAndLoad(template);
        }
        return template;
    }
}

// Bundled/Preloaded Namespace
export class BundledNamespace extends ComponentNamespace {
    constructor(config) {
        super(config); 
        this.folder = !!config.folder ? (config.folder.at(-1) === "/" ? config.folder : config.folder + "/") : '';
        this.components = new Map();
    }
    
    addComponents(globMap) {
        Object.entries(globMap).forEach(([path, content]) => {
            const name = path.split('/').pop().replace('.alpine.html', '');
            this.addComponent(name, content);
        });
    }

    async addComponent(name, html, registry) {
        this.components.set(name, html);
    }

    async fetch(componentName) {
        if (this.components.has(componentName)) {
            return this.components.get(componentName);
        }
        return super.fetch(componentName);
    }
    
    matchesPath(path) {
        return this.folder && path.startsWith(this.folder) && !path.replace(this.folder, "").includes("/");
    }
}

// CDN Namespace
export class CDNNamespace extends ComponentNamespace {
    constructor(config) {
        super(config);
        this.version = config.version;
        this.package = config.package;
    }
    
    resolve(componentName) {
        if (this.package) {
            return `${this.uri}${this.package}@${this.version}/${this.transform(componentName)}`;
        }
        return super.resolve(componentName);
    }
}

// Main Registry
export class NamespaceRegistry {
    constructor() {
        this.namespaces = new Map();
        this.defaultNamespace = null;
    }
    
    register(name, namespaceOrConfig) {
        let namespace;
        
        if (namespaceOrConfig instanceof ComponentNamespace) {
            namespace = namespaceOrConfig;
            namespace.prefix = name;
        } else {
            // Auto-create from config
            namespace = new ComponentNamespace({
                ...namespaceOrConfig,
                prefix: name
            });
        }
        
        this.namespaces.set(name, namespace);
        return namespace;
    }
    
    get(name) {
        return this.namespaces.get(name);
    }
    
    has(name) {
        return this.namespaces.has(name);
    }
    
    setDefault(name) {
        this.defaultNamespace = name;
    }

    logComponents() {
        this.namespaces.forEach((namespace, name) =>  namespace.components.forEach((comp, componentName) => console.log(`${name} -> ${componentName}`)))
    }
    
    findNamespace(tagName) {
        for (const [name, namespace] of this.namespaces) {
            if (namespace.matches(tagName)) {
                return { name, namespace };
            }
        }
        
        if (this.defaultNamespace) {
            return { 
                name: this.defaultNamespace, 
                namespace: this.namespaces.get(this.defaultNamespace) 
            };
        }
        
        return null;
    }
    
    async load(tagName) {
        const result = this.findNamespace(tagName);
        if (!result) {
            throw new Error(`No namespace registered for component: ${tagName}`);
        }
        return await result.namespace.load(tagName, this);
    }
    
    async findAndLoad(el) {
        const undefinedTags = getUndefinedCustomElements(el);
        
        if (undefinedTags.length === 0) return;
        await Promise.all(
            undefinedTags.map(tagName => this.load(tagName))
        );
    }
    
    // Utility to register from Vite glob - only works with BundledNamespace
    fromGlob(globMap) {
        Object.entries(globMap).forEach(([path, content]) => {
            const name = path.split('/').pop().replace('.alpine.html', '');
            
            // Find bundled namespace by checking folder match
            for (const [nsName, namespace] of this.namespaces) {
                if (namespace instanceof BundledNamespace && namespace.matchesPath(path)) {
                    const template = namespace.addComponent(name, content, this);
                    return;
                }
            }
            
            console.warn(`No BundledNamespace found for path: ${path}`);
        });
    }
}