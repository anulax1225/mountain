import Alpine from "alpinejs";
import UniversalRouter from "universal-router";

export function createRouter(currentPage = "", routes = []) {

    Alpine.store('router', {
        _router: null,
        $route: null,
        currentPage, 
        routes,
        init()  {
            this._router = new UniversalRouter(routes, {
                baseUrl: '/',
                context: { self: this },
                resolveRoute(context, params) {
                    context.self.$route = { params, path: context.pathname }
                    if (typeof context.route.action === 'function') {
                        return context.route.action(context, params)
                    }
                    return context.route.component
                }
            });
            this.onUrlChange();
            window.addEventListener('popstate', e => this.onUrlChange());
        },
        visit(path) {
            window.location.href = path;
        },
        onUrlChange() {
            let match = window.location.href.match(/#(.*)$/)
            let fragment = match ? match[1] : '';
            this._router.resolve({ pathname: fragment }).then(component => {
                if (component) this.currentPage = component;
            })
        },
    });

    return Alpine.store('router');
}

export function useRouter() {
    return Alpine.store('router');
}

