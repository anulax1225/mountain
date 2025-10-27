export const creatDispatcher = ($host) => {
    return (event, detail) => {
        $host.dispatchEvent(new CustomEvent(event, { detail, bubbles: true, composed: true }));
    };
}


export const $ref = (value) => Alpine.reactive({ value });
export const $reactive = (value) => Alpine.reactive(value);
export const $computed = (fn) => {
    const state = Alpine.reactive({ value: fn() });
    Alpine.effect(() => { state.value = fn(); });
    return {
        get value() {
            return state.value;
        }
    };
};