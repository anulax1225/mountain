import Alpine from "../alpinejs";
import UniversalRouter from "universal-router";

let storeName = "router";

export function createRouter(routes = [], {
    initialPage = "/",
    localStoreName = storeName,
} = {}) {
    Alpine.store(localStoreName, {
        _router: null,
        $route: null,
        currentPage: routes.find(route => route.path === initialPage).component,
        routes,
        init() {
            this._router = new UniversalRouter(routes, {
                baseUrl: '/',
                context: { self: this },
                resolveRoute(context, params) {
                    context.self.$route = { params, path: context.path }
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
            console.log(path);
            history.pushState({}, '', path);
            this.onUrlChange()
        },
        pathToPage(pathname) {
            if (pathname === '/' || pathname === '') {
                return 'page-home';
            }
            return 'page' + pathname.replaceAll('/', '-');
        },
        onUrlChange() {
            const fragment = this.pathToPage(window.location.pathname);
            this._router.resolve({ pathname: window.location.pathname }).then(component => {
                this.currentPage = component || fragment;
                console.log("[Alpine router] Visited page", this.currentPage);
            }).catch(() => {
                this.currentPage = fragment;
                console.log("[Alpine router] Fallback to", this.currentPage);
            });
        },
    });
    storeName = localStoreName;
    return Alpine.store(localStoreName);
}

export function useRouter() {
    return Alpine.store(storeName);
}

