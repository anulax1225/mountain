import Alpine from "../alpinejs";

export function setProps(props, defines, $host, deleteOriginals = false) {
    Object.entries(defines).forEach(([prop, config]) => {
        const defaultData = config.default !== undefined ? config.default : null;
        if ($host.hasAttribute(prop) || $host.hasAttribute(":" + prop)) {
            let propData = defaultData;
            if ($host.hasAttribute(":" + prop)) propData = Alpine.evaluate($host, $host.getAttribute(`:${prop}`));
            else if ($host.hasAttribute(prop)) propData = $host.getAttribute(prop);
            if (deleteOriginals) $host.removeAttribute(prop); 
            if (config.type === String && typeof propData !== 'string') console.warn(`prop ${prop} data type should be string`, propData);
            else if (config.type === Number && typeof propData !== 'number') console.warn(`prop ${prop} data type should be number`, propData);
            else if (config.type === Array && !Array.isArray(propData)) console.warn(`prop ${prop} data type should be array ${typeof propData}`, propData);
            else if (config.type === Object && typeof propData !== 'object') console.warn(`prop ${prop} data type should be object`, propData);
            props[prop] = propData;
        } else {
            props[prop] = defaultData;
        }
    });
}

export function propsBuilder($host, props) {
    return (defines) => {
        setProps(props, defines, $host);
        return new Proxy(props, {
            get(target, prop) {
                return target[prop];
            },
            definition() {
                return defines;
            }
        });
    }
};

export const ref = (value) => Alpine.reactive({ value });
export const reactive = (value) => Alpine.reactive(value);
export const effect = (fn) => Alpine.effect(fn);
export const computed = (fn) => {
    const state = Alpine.reactive({ value: fn() });
    Alpine.effect(() => { state.value = fn(); });
    return {
        get value() {
            return state.value;
        }
    };
};