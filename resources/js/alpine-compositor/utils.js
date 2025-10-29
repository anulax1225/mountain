
export const propsBuilder = ($host, _props) => {
    return (props) => {
        console.log(`Defining props for component ${$host.tagName}`);
        Object.entries(props).forEach(([prop, config]) => {
            const defaultData = config.default || null;
            if ($host.hasAttribute(prop) || $host.hasAttribute(":" + prop)) {
                let propData = defaultData;
                if ($host.hasAttribute(":" + prop)) propData = Alpine.evaluate($host, $host.getAttribute(`:${prop}`)) || null;
                else if ($host.hasAttribute(prop)) propData = $host.getAttribute(prop) || null;
                console.log(`prop (${prop}) = ${propData}`);
                if (config.type === String && typeof propData !== 'string') console.warn(`prop ${prop} data type should be string`, propData);
                else if (config.type === Number && typeof propData !== 'number') console.warn(`prop ${prop} data type should be number`, propData);
                else if (config.type === Array && typeof propData !== 'object') console.warn(`prop ${prop} data type should be array ${typeof propData}`, propData);
                else if (config.type === Object && typeof propData !== 'object') console.warn(`prop ${prop} data type should be object`, propData);
                _props[prop] = propData;
            } else {
                console.warn(`prop (${prop}) data not found`);
                _props[prop] = defaultData;
            }
        })
        return new Proxy(_props, {
            get(target, prop) {
                return target[prop];
            },
            definition() {
                return props;
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