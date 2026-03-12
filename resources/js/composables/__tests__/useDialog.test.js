import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('vue', async () => {
    const actual = await vi.importActual('vue');
    return {
        ...actual,
        onMounted: vi.fn((cb) => cb()),
        onUnmounted: vi.fn(),
    };
});

import { useDialog, useDialogStack } from '@/composables/useDialog';

describe('useDialog', () => {
    beforeEach(() => {
        document.body.style.overflow = '';
    });

    it('isOpen starts as false', () => {
        const { isOpen } = useDialog();
        expect(isOpen.value).toBe(false);
    });

    it('open sets isOpen to true', () => {
        const { open, isOpen } = useDialog();
        open();
        expect(isOpen.value).toBe(true);
    });

    it('close sets isOpen to false', () => {
        const { open, close, isOpen } = useDialog();
        open();
        close();
        expect(isOpen.value).toBe(false);
    });

    it('toggle flips state', () => {
        const { toggle, isOpen } = useDialog();

        toggle();
        expect(isOpen.value).toBe(true);

        toggle();
        expect(isOpen.value).toBe(false);
    });

    it('open sets body overflow to hidden', () => {
        const { open } = useDialog();
        open();
        expect(document.body.style.overflow).toBe('hidden');
    });

    it('close restores body overflow', () => {
        const { open, close } = useDialog();
        open();
        expect(document.body.style.overflow).toBe('hidden');

        close();
        expect(document.body.style.overflow).toBe('');
    });

    it('open does nothing if already open', () => {
        const onOpen = vi.fn();
        const { open } = useDialog({ onOpen });

        open();
        expect(onOpen).toHaveBeenCalledTimes(1);

        open();
        // Should not call onOpen again
        expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('close does nothing if already closed', () => {
        const onClose = vi.fn();
        const { close } = useDialog({ onClose });

        close();
        // Should not call onClose since dialog was never open
        expect(onClose).not.toHaveBeenCalled();
    });
});

describe('useDialogStack', () => {
    beforeEach(() => {
        // Reset the shared openDialogs array
        const { openDialogs } = useDialogStack();
        openDialogs.value = [];
    });

    it('registerDialog adds to stack', () => {
        const { registerDialog, openDialogs } = useDialogStack();
        registerDialog('dialog-1');
        expect(openDialogs.value).toContain('dialog-1');
    });

    it('unregisterDialog removes from stack', () => {
        const { registerDialog, unregisterDialog, openDialogs } = useDialogStack();
        registerDialog('dialog-1');
        registerDialog('dialog-2');

        unregisterDialog('dialog-1');
        expect(openDialogs.value).not.toContain('dialog-1');
        expect(openDialogs.value).toContain('dialog-2');
    });

    it('isTopDialog returns correct value', () => {
        const { registerDialog, isTopDialog } = useDialogStack();
        registerDialog('dialog-1');
        registerDialog('dialog-2');

        expect(isTopDialog('dialog-2')).toBe(true);
        expect(isTopDialog('dialog-1')).toBe(false);
    });

    it('hasOpenDialogs computed is correct', () => {
        const { registerDialog, unregisterDialog, hasOpenDialogs } = useDialogStack();

        expect(hasOpenDialogs.value).toBe(false);

        registerDialog('dialog-1');
        expect(hasOpenDialogs.value).toBe(true);

        unregisterDialog('dialog-1');
        expect(hasOpenDialogs.value).toBe(false);
    });

    it('registerDialog does not add duplicates', () => {
        const { registerDialog, openDialogs } = useDialogStack();
        registerDialog('dialog-1');
        registerDialog('dialog-1');
        expect(openDialogs.value.length).toBe(1);
    });
});
