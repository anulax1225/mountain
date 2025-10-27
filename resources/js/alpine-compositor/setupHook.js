const _props = Alpine.reactive({});

const defineProps = (props) => {
    Object.entries(props).forEach(([prop, config]) => {
        let propData = config.default;
        if ($host.hasAttribute(`:${prop}`)) propData =  Alpine.evaluate($host, Alpine.bound($host, `:${prop}`, config.default)); 
        else propData = Alpine.bound($host, `${prop}`, config.default);

        if (config.type === String && typeof propData !== 'string') console.warn(`prop ${prop} data type should be string`, propData);
        else if (config.type === Number && typeof propData !== 'number') console.warn(`prop ${prop} data type should be number`, propData);
        else if (config.type === Array && typeof propData !== 'object') console.warn(`prop ${prop} data type should be array ${typeof propData}`, propData);
        else if (config.type === Object && typeof propData !== 'object') console.warn(`prop ${prop} data type should be object`, propData);

        _props[prop] = propData;
    })
    return new Proxy(_props, {
        get(target, prop) {
            return target[prop];
        }
    });
};

const $dispatch = (event, detail) => {
    $host.dispatchEvent(new CustomEvent(event, { detail, bubbles: true, composed: true }));
};

const $ref = (value) => Alpine.reactive({ value });
const $reactive = (value) => Alpine.reactive(value);
const $computed = (fn) => {
    const state = Alpine.reactive({ value: fn() });
    Alpine.effect(() => { state.value = fn(); });
    return {
        get value() {
            return state.value;
        }
    };
};

// Execute user's setup code
const userCode = () => {
    //user-hook
};

// Return component data and methods
return {
    $props: new Proxy(_props, {
        get(target, prop) {
            return target[prop];
        }
    }),
    $host,
    ...(userCode() || {}),
};