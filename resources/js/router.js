import Alpine from "alpinejs";
import { $ref } from "./alpine-compositor/utils";

export function createRouter(currentPage = "", routes = []) {
    Alpine.store('router', {
        currentPage, routes,
        init() {
            const router = new UniversalRouter(this.routes, {
                context: { self: this },
                resolveRoute(context, params) {
                    context.self.$route = { params, path: context.pathname }
                    if (typeof context.route.action === 'function') {
                        return context.route.action(context, params)
                    }
                    return context.route.component
                }
            })
            Object.assign(this, router);
            console.log(this, router);
            this.onUrlChange();
            window.addEventListener('popstate', e => this.onUrlChange());
        },
        onUrlChange() {
            let match = window.location.href.match(/#(.*)$/)
            let fragment = match ? match[1] : ''
            this.resolve({ pathname: fragment }).then(component => {
                if (component) {
                    let pos = component.indexOf('@')
                    let from = pos !== -1 ? component.substring(pos + 1) : component.replace('-', ':').replace('-', '/')
                    if (pos !== -1) component = component.substring(0, pos)
                    this.pageToImport = from
                    this.pageContent = `<${component}></${component}>`
                }
            })
        },
    });
    return Alpine.store('router');
}

export function useRouter() {
    return Alpine.store('router');
}

