import { vi } from 'vitest';
import { config } from '@vue/test-utils';

// Mock @inertiajs/vue3
vi.mock('@inertiajs/vue3', () => ({
    usePage: vi.fn(() => ({
        props: {
            auth: { user: null },
            name: 'Test App',
            quote: { message: 'Test quote', author: 'Test author' },
        },
    })),
    router: {
        visit: vi.fn(),
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
        reload: vi.fn(),
        replace: vi.fn(),
    },
    useForm: vi.fn((data: Record<string, unknown>) => ({
        ...data,
        errors: {},
        hasErrors: false,
        processing: false,
        wasSuccessful: false,
        recentlySuccessful: false,
        transform: vi.fn().mockReturnThis(),
        reset: vi.fn(),
        clearErrors: vi.fn(),
        setError: vi.fn(),
        submit: vi.fn(),
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    })),
    Link: {
        name: 'Link',
        template: '<a><slot /></a>',
        props: ['href', 'method', 'as', 'data'],
    },
    Head: {
        name: 'Head',
        template: '<div><slot /></div>',
        props: ['title'],
    },
}));

// Stub window.location for tests that need it
Object.defineProperty(window, 'location', {
    value: {
        origin: 'http://localhost',
        href: 'http://localhost',
        pathname: '/',
        search: '',
        hash: '',
        assign: vi.fn(),
        replace: vi.fn(),
        reload: vi.fn(),
    },
    writable: true,
});
