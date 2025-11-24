import UniversalRouter from "universal-router";

export function createRouter(currentPage = "", routes = []) {
    Alpine.store('router', {
        _router: null,
        $route: null,
        currentPage,
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

    return Alpine.store('router');
}

export function useRouter() {
    return Alpine.store('router');
}

