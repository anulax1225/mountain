import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('vue', async () => {
    const actual = await vi.importActual('vue');
    return {
        ...actual,
        h: vi.fn(() => ({})),
        render: vi.fn(),
    };
});

vi.mock('@/components/ConfirmDialog.vue', () => ({ default: {} }));

import { h, render } from 'vue';
import { useConfirm } from '@/composables/useConfirm';

describe('useConfirm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('confirm returns a Promise', () => {
        const { confirm } = useConfirm();
        const result = confirm({ title: 'Test' });
        expect(result).toBeInstanceOf(Promise);
    });

    it('confirmDelete calls confirm with destructive variant', () => {
        const { confirmDelete } = useConfirm();
        const result = confirmDelete('test item');

        expect(result).toBeInstanceOf(Promise);
        // h should have been called with props that include variant: 'destructive'
        expect(h).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                variant: 'destructive',
                title: 'Confirmer la suppression',
            }),
        );
    });

    it('confirmLeave resolves true if no unsaved changes', async () => {
        const { confirmLeave } = useConfirm();
        const result = await confirmLeave(false);
        expect(result).toBe(true);
    });

    it('confirmLeave calls confirm with destructive variant when has unsaved changes', () => {
        const { confirmLeave } = useConfirm();
        const result = confirmLeave(true);

        expect(result).toBeInstanceOf(Promise);
        expect(h).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                variant: 'destructive',
            }),
        );
    });

    it('confirmAction with known action uses correct config', () => {
        const { confirmAction } = useConfirm();

        confirmAction('publish', 'my project');
        expect(h).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                title: 'Publier',
                variant: 'default',
            }),
        );
    });

    it('confirmAction with unknown action uses fallback config', () => {
        const { confirmAction } = useConfirm();

        confirmAction('unknown-action', 'item');
        expect(h).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                title: "Confirmer l'action",
                variant: 'default',
            }),
        );
    });
});
