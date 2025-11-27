import Alpine from "../alpinejs";

const propsPrefix = "#";

export function setProps(props, defines, $host) {
    Object.entries(defines).forEach(([prop, config]) => {
        const defaultData = config.default !== undefined ? config.default : null;
        if ($host.hasAttribute(prop) || $host.hasAttribute(`${propsPrefix}${prop}`)) {
            let propData = defaultData;
            if ($host.hasAttribute(`${propsPrefix}${prop}`)) propData = Alpine.evaluate($host, $host.getAttribute(`${propsPrefix}${prop}`));
            else if ($host.hasAttribute(prop)) propData = $host.getAttribute(prop);

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

/**
 * Alpine-compatible reactivity utilities - MINIMAL VERSION
 * Assumes Alpine is already available as window.Alpine
 */

const _refBrand = Symbol('ref');

export function effect(callback) {
    Alpine.effect(callback);
}

/**
 * Creates a reactive reference
 */
export function ref(value = undefined) {
    if (isRef(value)) return value;

    return Object.seal(Alpine.reactive({
        [_refBrand]: true,
        value: value,
    }));
}

/**
 * Creates a computed ref
 */
export function computed(cb) {
    const innerValue = ref();

    const val = Object.freeze({
        [_refBrand]: true,
        effect: true,
        get value() {
            return innerValue.value;
        },
    });

    Alpine.effect(() => {
        innerValue.value = cb();
    });

    return val;
}

/**
 * Creates a writable computed ref
 */
export function writableComputed(options) {
    return Object.seal({
        [_refBrand]: true,
        get value() {
            return options.get();
        },
        set value(newVal) {
            options.set(newVal);
        },
    });
}

/**
 * Checks if value is a ref
 */
export function isRef(value) {
    return value?.[_refBrand] === true;
}

/**
 * Checks if value is computed
 */
export function isComputed(value) {
    return isRef(value) && value.effect === true;
}

/**
 * Unwraps a ref
 */
export function unref(ref) {
    return isRef(ref) ? ref.value : ref;
}

/**
 * Creates a shallow ref
 */
export function shallowRef(initialValue = undefined) {
    const innerRef = ref(initialValue);
    return writableComputed({
        get: () => innerRef.value,
        set: (newValue) => innerRef.value = newValue,
    });
}

/**
 * Creates a ref from object property
 */
export function toRef(object, key) {
    return writableComputed({
        get: () => object[key],
        set: (value) => object[key] = value,
    });
}

/**
 * Converts object properties to refs
 */
export function toRefs(object) {
    const ret = Array.isArray(object) ? new Array(object.length) : {};

    for (const key in object) {
        ret[key] = ref(object[key]);
        computed(() => {
            ret[key].value = object[key];
        });
    }

    return ret;
}

/**
 * Creates a reactive proxy
 */
export function reactive(val) {
    return Alpine.reactive(val);
}

/**
 * Returns the raw object
 */
export function toRaw(...args) {
    return Alpine.raw(...args);
}

/**
 * Stops a reactive effect
 */
export function stop(...args) {
    return Alpine.release(...args);
}

/**
 * Creates a readonly proxy
 */
export function readonly(target) {
    if (typeof target !== 'object' || target === null) {
        return target;
    }

    return new Proxy(target, {
        get(target, key, receiver) {
            const result = Reflect.get(target, key, receiver);
            return readonly(result);
        },
        set(target, key) {
            console.warn(`Cannot set property ${key.toString()} on readonly object`);
            return true;
        },
        deleteProperty(target, key) {
            console.warn(`Cannot delete property ${key.toString()} on readonly object`);
            return true;
        },
    });
}

/**
 * Runs effect when dependencies change
 */
export function watchEffect(effect) {
    const stopHandle = Alpine.effect(effect);
    return () => stopHandle();
}

/**
 * Watches a reactive source
 */
export function watch(source, cb, options = {}) {
    const { immediate, deep, flush = 'pre' } = options;
    let getter;
    let isMultiSource = false;

    if (isRef(source)) {
        getter = () => source.value;
    } else if (Array.isArray(source)) {
        isMultiSource = true;
        getter = () => source.map((s) => {
            if (isRef(s)) return s.value;
            if (typeof s === 'function') return s();
            console.warn('invalid source');
            return undefined;
        });
    } else if (typeof source === 'function') {
        getter = source;
    } else {
        getter = () => { };
    }

    if (deep) {
        const baseGetter = getter;
        getter = () => traverse(baseGetter());
    }

    const INITIAL = Symbol('initial');
    let oldValue = isMultiSource ? [] : INITIAL;
    let isFirstRun = true;

    return watchEffect(() => {
        const newValue = getter();

        if (isFirstRun) {
            isFirstRun = false;
            if (!immediate) {
                oldValue = newValue;
                return;
            }
        }

        const didChange = isMultiSource
            ? newValue.some((v, i) => !Object.is(v, oldValue[i]))
            : !Object.is(newValue, oldValue);

        if (didChange) {
            const runCb = () => cb(
                newValue,
                oldValue === INITIAL ? undefined : oldValue
            );
            oldValue = newValue;

            if (flush === 'post') {
                Alpine.nextTick(() => runCb());
            } else {
                runCb();
            }
        }
    });
}

// Helper: traverse for deep watching
function traverse(value, seen = new Set()) {
    if (!value || typeof value !== 'object' || seen.has(value)) {
        return value;
    }

    seen.add(value);

    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            traverse(value[i], seen);
        }
    } else if (value instanceof Map) {
        value.forEach((_, key) => traverse(value.get(key), seen));
    } else if (value instanceof Set) {
        value.forEach((v) => traverse(v, seen));
    } else {
        for (const key of Object.keys(value)) {
            traverse(value[key], seen);
        }
    }

    return value;
}