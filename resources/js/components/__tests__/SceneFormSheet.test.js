import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import SceneFormSheet from '@/components/dashboard/SceneFormSheet.vue';

vi.mock('@/components/ui/sheet', () => ({
    Sheet: {
        name: 'Sheet',
        template: '<div data-testid="sheet"><slot /></div>',
        props: ['open'],
    },
    SheetContent: {
        name: 'SheetContent',
        template: '<div data-testid="sheet-content"><slot /></div>',
    },
    SheetHeader: {
        name: 'SheetHeader',
        template: '<div data-testid="sheet-header"><slot /></div>',
    },
    SheetTitle: {
        name: 'SheetTitle',
        template: '<span data-testid="sheet-title"><slot /></span>',
    },
    SheetDescription: {
        name: 'SheetDescription',
        template: '<span data-testid="sheet-description"><slot /></span>',
    },
}));

vi.mock('@/components/ui/input', () => ({
    Input: {
        name: 'Input',
        template: '<input :value="modelValue" @input="$emit(\'update:model-value\', $event.target.value)" />',
        props: ['modelValue', 'id', 'placeholder'],
        emits: ['update:model-value'],
    },
}));

vi.mock('@/components/ui/label', () => ({
    Label: {
        name: 'Label',
        template: '<label><slot /></label>',
        props: ['for'],
    },
}));

vi.mock('@/components/ui/button', () => ({
    Button: {
        name: 'Button',
        template: '<button :type="type"><slot /></button>',
        props: ['type'],
    },
}));

describe('SceneFormSheet', () => {
    const defaultProps = {
        open: true,
        editingScene: null,
        form: { name: '' },
    };

    function createWrapper(props = {}) {
        return mount(SceneFormSheet, {
            props: { ...defaultProps, ...props },
        });
    }

    describe('title and description for create mode', () => {
        it('shows create title when editingScene is null', () => {
            const wrapper = createWrapper({ editingScene: null });
            expect(wrapper.find('[data-testid="sheet-title"]').text()).toBe('Nouvelle scène');
        });

        it('shows create description when editingScene is null', () => {
            const wrapper = createWrapper({ editingScene: null });
            expect(wrapper.find('[data-testid="sheet-description"]').text()).toContain('Créer une nouvelle scène dans ce projet');
        });

        it('shows create button text when editingScene is null', () => {
            const wrapper = createWrapper({ editingScene: null });
            expect(wrapper.find('button[type="submit"]').text()).toContain('Créer la scène');
        });
    });

    describe('title and description for edit mode', () => {
        const editingScene = { id: 1, name: 'Test Scene' };

        it('shows edit title when editingScene is provided', () => {
            const wrapper = createWrapper({ editingScene });
            expect(wrapper.find('[data-testid="sheet-title"]').text()).toBe('Modifier la scène');
        });

        it('shows edit description when editingScene is provided', () => {
            const wrapper = createWrapper({ editingScene });
            expect(wrapper.find('[data-testid="sheet-description"]').text()).toContain('Modifier les informations de la scène');
        });

        it('shows save button text when editingScene is provided', () => {
            const wrapper = createWrapper({ editingScene });
            expect(wrapper.find('button[type="submit"]').text()).toBe('Enregistrer');
        });
    });

    describe('form interactions', () => {
        it('emits update:form when input value changes', async () => {
            const wrapper = createWrapper({ form: { name: 'old' } });
            const input = wrapper.find('input');
            await input.setValue('new name');

            const emitted = wrapper.emitted('update:form');
            expect(emitted).toBeTruthy();
            expect(emitted[0][0]).toEqual({ name: 'new name' });
        });

        it('emits submit when form is submitted', async () => {
            const wrapper = createWrapper();
            await wrapper.find('form').trigger('submit');
            expect(wrapper.emitted('submit')).toBeTruthy();
        });
    });
});
