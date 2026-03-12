import { describe, it, expect, vi } from 'vitest';

vi.mock('@/components/ui/toast/use-toast', () => ({
    useToast: () => ({ toast: vi.fn() }),
}));

import { useForm, validators } from '../useForm';

describe('useForm', () => {
    describe('initial state', () => {
        it('has reactive initial data', () => {
            const { data } = useForm({ name: 'John', email: 'john@test.com' });
            expect(data.name).toBe('John');
            expect(data.email).toBe('john@test.com');
        });

        it('hasErrors is false initially', () => {
            const { hasErrors } = useForm({ name: '' });
            expect(hasErrors.value).toBe(false);
        });

        it('isDirty is false initially', () => {
            const { isDirty } = useForm({ name: '' });
            expect(isDirty.value).toBe(false);
        });
    });

    describe('setData', () => {
        it('updates a field and marks dirty', () => {
            const { data, isDirty, setData } = useForm({ name: '' });
            setData('name', 'Jane');
            expect(data.name).toBe('Jane');
            expect(isDirty.value).toBe(true);
        });

        it('clears the error for the updated field', () => {
            const { errors, setData, setErrors } = useForm({ name: '' });
            setErrors({ name: 'Required' });
            expect(errors.value.name).toBe('Required');
            setData('name', 'Jane');
            expect(errors.value.name).toBeUndefined();
        });
    });

    describe('clearErrors', () => {
        it('removes all errors', () => {
            const { errors, hasErrors, setErrors, clearErrors } = useForm({ name: '' });
            setErrors({ name: 'Required', email: 'Invalid' });
            expect(hasErrors.value).toBe(true);
            clearErrors();
            expect(hasErrors.value).toBe(false);
            expect(Object.keys(errors.value).length).toBe(0);
        });
    });

    describe('hasErrors', () => {
        it('is true after setErrors', () => {
            const { hasErrors, setErrors } = useForm({ name: '' });
            setErrors({ name: 'Required' });
            expect(hasErrors.value).toBe(true);
        });
    });

    describe('reset', () => {
        it('restores initial data', () => {
            const { data, isDirty, setData, reset } = useForm({ name: 'original', count: 0 });
            setData('name', 'changed');
            setData('count', 5);
            reset();
            expect(data.name).toBe('original');
            expect(data.count).toBe(0);
            expect(isDirty.value).toBe(false);
        });
    });

    describe('fill', () => {
        it('updates only matching keys', () => {
            const { data, fill } = useForm({ name: 'old', email: 'old@test.com' });
            fill({ name: 'new', unknown: 'ignored' });
            expect(data.name).toBe('new');
            expect(data.email).toBe('old@test.com');
            expect(data.unknown).toBeUndefined();
        });
    });

    describe('submit', () => {
        it('calls submitFn with data', async () => {
            const submitFn = vi.fn().mockResolvedValue({ id: 1 });
            const { submit } = useForm({ name: 'test' });
            const result = await submit(submitFn);
            expect(submitFn).toHaveBeenCalled();
            expect(result.success).toBe(true);
        });

        it('handles validation errors from API', async () => {
            const apiError = {
                response: {
                    status: 422,
                    data: {
                        errors: {
                            name: ['The name field is required.'],
                        },
                    },
                },
            };
            const submitFn = vi.fn().mockRejectedValue(apiError);
            const { submit, errors } = useForm({ name: '' });
            const result = await submit(submitFn);
            expect(result.success).toBe(false);
            expect(errors.value.name).toEqual(['The name field is required.']);
        });
    });
});

describe('validators', () => {
    describe('required', () => {
        const rule = validators.required();

        it('returns message for empty string', () => {
            expect(rule('')).toBe('Ce champ est requis');
        });

        it('returns message for null', () => {
            expect(rule(null)).toBe('Ce champ est requis');
        });

        it('returns message for undefined', () => {
            expect(rule(undefined)).toBe('Ce champ est requis');
        });

        it('returns true for filled value', () => {
            expect(rule('hello')).toBe(true);
        });
    });

    describe('email', () => {
        const rule = validators.email();

        it('returns message for invalid email', () => {
            expect(rule('not-an-email')).toBe('Email invalide');
        });

        it('returns true for valid email', () => {
            expect(rule('user@example.com')).toBe(true);
        });

        it('returns true for empty value (not required)', () => {
            expect(rule('')).toBe(true);
        });
    });

    describe('minLength', () => {
        const rule = validators.minLength(5);

        it('returns message for short string', () => {
            expect(rule('abc')).toBe('Minimum 5 caractères requis');
        });

        it('returns true for long enough string', () => {
            expect(rule('abcdef')).toBe(true);
        });

        it('returns true for empty value (not required)', () => {
            expect(rule('')).toBe(true);
        });
    });
});
