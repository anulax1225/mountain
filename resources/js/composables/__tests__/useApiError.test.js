import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/components/ui/toast/use-toast', () => ({
    useToast: () => ({ toast: vi.fn() }),
}));

import { useApiError } from '@/composables/useApiError';

describe('useApiError', () => {
    let apiError;

    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        apiError = useApiError();
    });

    describe('getErrorMessage', () => {
        it('returns first validation error for 422 status', () => {
            const error = {
                response: {
                    status: 422,
                    data: {
                        errors: {
                            email: ['The email field is required.'],
                            name: ['The name field is required.'],
                        },
                    },
                },
            };

            expect(apiError.getErrorMessage(error)).toBe('The email field is required.');
        });

        it('returns status message for 401', () => {
            const error = {
                response: {
                    status: 401,
                    data: {},
                },
            };

            expect(apiError.getErrorMessage(error)).toBe('Non authentifié');
        });

        it('returns status message for 403', () => {
            const error = {
                response: {
                    status: 403,
                    data: {},
                },
            };

            expect(apiError.getErrorMessage(error)).toBe('Accès refusé');
        });

        it('returns status message for 404', () => {
            const error = {
                response: {
                    status: 404,
                    data: {},
                },
            };

            expect(apiError.getErrorMessage(error)).toBe('Ressource introuvable');
        });

        it('returns status message for 500', () => {
            const error = {
                response: {
                    status: 500,
                    data: {},
                },
            };

            expect(apiError.getErrorMessage(error)).toBe('Erreur serveur interne');
        });

        it('returns connection message when no response (network error)', () => {
            const error = {
                request: {},
            };

            expect(apiError.getErrorMessage(error)).toBe('Impossible de se connecter au serveur');
        });

        it('returns custom data.message when present', () => {
            const error = {
                response: {
                    status: 400,
                    data: { message: 'Custom error message' },
                },
            };

            expect(apiError.getErrorMessage(error)).toBe('Custom error message');
        });

        it('returns fallback error message for unknown status without data.message', () => {
            const error = {
                response: {
                    status: 418,
                    data: {},
                },
            };

            expect(apiError.getErrorMessage(error)).toBe('Erreur 418');
        });
    });

    describe('isNetworkError', () => {
        it('returns true when request exists but no response', () => {
            const error = { request: {}, response: undefined };
            expect(apiError.isNetworkError(error)).toBe(true);
        });

        it('returns false when response exists', () => {
            const error = { request: {}, response: { status: 500 } };
            expect(apiError.isNetworkError(error)).toBe(false);
        });
    });

    describe('isValidationError', () => {
        it('returns true for status 422', () => {
            const error = { response: { status: 422 } };
            expect(apiError.isValidationError(error)).toBe(true);
        });

        it('returns false for other statuses', () => {
            const error = { response: { status: 400 } };
            expect(apiError.isValidationError(error)).toBe(false);
        });
    });

    describe('isAuthError', () => {
        it('returns true for 401', () => {
            const error = { response: { status: 401 } };
            expect(apiError.isAuthError(error)).toBe(true);
        });

        it('returns true for 403', () => {
            const error = { response: { status: 403 } };
            expect(apiError.isAuthError(error)).toBe(true);
        });

        it('returns false for other statuses', () => {
            const error = { response: { status: 500 } };
            expect(apiError.isAuthError(error)).toBe(false);
        });
    });

    describe('getValidationErrors', () => {
        it('returns errors object for 422', () => {
            const errors = { email: ['Required'], name: ['Too short'] };
            const error = {
                response: {
                    status: 422,
                    data: { errors },
                },
            };

            expect(apiError.getValidationErrors(error)).toEqual(errors);
        });

        it('returns empty object for non-422', () => {
            const error = {
                response: {
                    status: 400,
                    data: { errors: { field: ['error'] } },
                },
            };

            expect(apiError.getValidationErrors(error)).toEqual({});
        });
    });

    describe('handleError', () => {
        it('sets lastError', () => {
            const error = { request: {} };

            apiError.handleError(error, { showToast: false, logToConsole: false });
            expect(apiError.lastError.value).toStrictEqual(error);
        });
    });
});
