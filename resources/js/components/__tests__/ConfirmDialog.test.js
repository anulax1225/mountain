import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

vi.mock('@/components/ui/dialog', () => ({
    Dialog: {
        name: 'Dialog',
        template: '<div data-testid="dialog"><slot /></div>',
        props: ['open', 'modelValue'],
    },
    DialogContent: {
        name: 'DialogContent',
        template: '<div data-testid="dialog-content"><slot /></div>',
    },
    DialogHeader: {
        name: 'DialogHeader',
        template: '<div data-testid="dialog-header"><slot /></div>',
    },
    DialogTitle: {
        name: 'DialogTitle',
        template: '<span data-testid="dialog-title"><slot /></span>',
    },
    DialogDescription: {
        name: 'DialogDescription',
        template: '<span data-testid="dialog-description"><slot /></span>',
    },
    DialogFooter: {
        name: 'DialogFooter',
        template: '<div data-testid="dialog-footer"><slot /></div>',
    },
}));

vi.mock('@/components/ui/button', () => ({
    Button: {
        name: 'Button',
        template: '<button :disabled="disabled" :data-variant="variant"><slot /></button>',
        props: ['variant', 'disabled'],
    },
}));

vi.mock('lucide-vue-next', () => ({
    Loader2: {
        name: 'Loader2',
        template: '<span data-testid="loader" />',
    },
}));

describe('ConfirmDialog', () => {
    const defaultProps = {
        open: true,
    };

    function createWrapper(props = {}) {
        return mount(ConfirmDialog, {
            props: { ...defaultProps, ...props },
        });
    }

    describe('rendering with default props', () => {
        it('renders the default title', () => {
            const wrapper = createWrapper();
            expect(wrapper.find('[data-testid="dialog-title"]').text()).toBe("Confirmer l'action");
        });

        it('renders the default confirm button text', () => {
            const wrapper = createWrapper();
            const buttons = wrapper.findAll('button');
            const confirmButton = buttons[1];
            expect(confirmButton.text()).toContain('Confirmer');
        });

        it('renders the default cancel button text', () => {
            const wrapper = createWrapper();
            const buttons = wrapper.findAll('button');
            const cancelButton = buttons[0];
            expect(cancelButton.text()).toBe('Annuler');
        });

        it('does not render description when not provided', () => {
            const wrapper = createWrapper();
            expect(wrapper.find('[data-testid="dialog-description"]').exists()).toBe(false);
        });

        it('does not render message when not provided', () => {
            const wrapper = createWrapper();
            expect(wrapper.find('.text-foreground').exists()).toBe(false);
        });
    });

    describe('rendering with custom props', () => {
        it('renders custom title', () => {
            const wrapper = createWrapper({ title: 'Supprimer ?' });
            expect(wrapper.find('[data-testid="dialog-title"]').text()).toBe('Supprimer ?');
        });

        it('renders description when provided', () => {
            const wrapper = createWrapper({ description: 'Cette action est irréversible' });
            expect(wrapper.find('[data-testid="dialog-description"]').text()).toBe('Cette action est irréversible');
        });

        it('renders message when provided', () => {
            const wrapper = createWrapper({ message: 'Êtes-vous sûr ?' });
            expect(wrapper.find('.text-foreground').text()).toBe('Êtes-vous sûr ?');
        });

        it('renders custom confirm and cancel text', () => {
            const wrapper = createWrapper({ confirmText: 'Oui', cancelText: 'Non' });
            const buttons = wrapper.findAll('button');
            expect(buttons[0].text()).toBe('Non');
            expect(buttons[1].text()).toContain('Oui');
        });

        it('passes variant to confirm button', () => {
            const wrapper = createWrapper({ variant: 'destructive' });
            const buttons = wrapper.findAll('button');
            const confirmButton = buttons[1];
            expect(confirmButton.attributes('data-variant')).toBe('destructive');
        });
    });

    describe('handleConfirm', () => {
        it('emits confirm event', async () => {
            const wrapper = createWrapper();
            const buttons = wrapper.findAll('button');
            await buttons[1].trigger('click');
            await vi.dynamicImportSettled();
            expect(wrapper.emitted('confirm')).toBeTruthy();
        });

        it('calls onConfirm callback when provided', async () => {
            const onConfirm = vi.fn().mockResolvedValue(undefined);
            const wrapper = createWrapper({ onConfirm });
            const buttons = wrapper.findAll('button');
            await buttons[1].trigger('click');
            await vi.dynamicImportSettled();
            // onConfirm is called once by handleConfirm directly, and once
            // by Vue's on-prop convention when 'confirm' is emitted (onConfirm matches emit('confirm'))
            expect(onConfirm).toHaveBeenCalledTimes(2);
        });

        it('emits update:open with false after confirm', async () => {
            const wrapper = createWrapper();
            const buttons = wrapper.findAll('button');
            await buttons[1].trigger('click');
            await vi.dynamicImportSettled();
            const updateOpen = wrapper.emitted('update:open');
            expect(updateOpen).toBeTruthy();
            expect(updateOpen[updateOpen.length - 1]).toEqual([false]);
        });

        it('shows loader during async onConfirm', async () => {
            let resolveConfirm;
            const onConfirm = vi.fn(() => new Promise((resolve) => { resolveConfirm = resolve; }));
            const wrapper = createWrapper({ onConfirm });

            const buttons = wrapper.findAll('button');
            buttons[1].trigger('click');
            await vi.dynamicImportSettled();

            // During the async operation, loading should be true
            expect(wrapper.find('[data-testid="loader"]').exists()).toBe(true);

            // Buttons should be disabled during loading
            expect(buttons[0].attributes('disabled')).toBeDefined();
            expect(buttons[1].attributes('disabled')).toBeDefined();

            // Resolve and wait
            resolveConfirm();
            await vi.dynamicImportSettled();
        });

        it('does not crash when onConfirm throws', async () => {
            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
            const onConfirm = vi.fn().mockRejectedValue(new Error('fail'));
            const wrapper = createWrapper({ onConfirm });

            const buttons = wrapper.findAll('button');
            await buttons[1].trigger('click');
            await vi.dynamicImportSettled();

            expect(consoleError).toHaveBeenCalled();
            // Should not have emitted confirm since error was thrown
            expect(wrapper.emitted('confirm')).toBeFalsy();

            consoleError.mockRestore();
        });

        it('resets loading state after onConfirm error', async () => {
            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
            const onConfirm = vi.fn().mockRejectedValue(new Error('fail'));
            const wrapper = createWrapper({ onConfirm });

            const buttons = wrapper.findAll('button');
            await buttons[1].trigger('click');
            await vi.dynamicImportSettled();

            // After error, loader should not be shown
            expect(wrapper.find('[data-testid="loader"]').exists()).toBe(false);

            consoleError.mockRestore();
        });
    });

    describe('handleCancel', () => {
        it('emits cancel event', async () => {
            const wrapper = createWrapper();
            const buttons = wrapper.findAll('button');
            await buttons[0].trigger('click');
            expect(wrapper.emitted('cancel')).toBeTruthy();
        });

        it('calls onCancel callback when provided', async () => {
            const onCancel = vi.fn();
            const wrapper = createWrapper({ onCancel });
            const buttons = wrapper.findAll('button');
            await buttons[0].trigger('click');
            // onCancel is called once by handleCancel directly, and once
            // by Vue's on-prop convention when 'cancel' is emitted (onCancel matches emit('cancel'))
            expect(onCancel).toHaveBeenCalledTimes(2);
        });

        it('emits update:open with false after cancel', async () => {
            const wrapper = createWrapper();
            const buttons = wrapper.findAll('button');
            await buttons[0].trigger('click');
            const updateOpen = wrapper.emitted('update:open');
            expect(updateOpen).toBeTruthy();
            expect(updateOpen[updateOpen.length - 1]).toEqual([false]);
        });
    });
});
