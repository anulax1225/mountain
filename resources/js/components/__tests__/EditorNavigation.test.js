import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import EditorNavigation from '@/components/dashboard/editor/EditorNavigation.vue';

vi.mock('@/components/ui/button', () => ({
    Button: {
        name: 'Button',
        template: '<button><slot /></button>',
        props: ['variant', 'size'],
    },
}));

vi.mock('lucide-vue-next', () => ({
    ChevronLeft: {
        name: 'ChevronLeft',
        template: '<span data-testid="chevron-left" />',
    },
    ChevronRight: {
        name: 'ChevronRight',
        template: '<span data-testid="chevron-right" />',
    },
}));

describe('EditorNavigation', () => {
    function createWrapper(props = {}) {
        return mount(EditorNavigation, { props });
    }

    describe('prev button visibility', () => {
        it('hides prev button when currentIndex is 0', () => {
            const wrapper = createWrapper({ currentIndex: 0, totalImages: 5 });
            expect(wrapper.find('[data-testid="chevron-left"]').exists()).toBe(false);
        });

        it('shows prev button when currentIndex is greater than 0', () => {
            const wrapper = createWrapper({ currentIndex: 1, totalImages: 5 });
            expect(wrapper.find('[data-testid="chevron-left"]').exists()).toBe(true);
        });

        it('shows prev button at the last index', () => {
            const wrapper = createWrapper({ currentIndex: 4, totalImages: 5 });
            expect(wrapper.find('[data-testid="chevron-left"]').exists()).toBe(true);
        });
    });

    describe('next button visibility', () => {
        it('hides next button when at the last image', () => {
            const wrapper = createWrapper({ currentIndex: 4, totalImages: 5 });
            expect(wrapper.find('[data-testid="chevron-right"]').exists()).toBe(false);
        });

        it('shows next button when not at the last image', () => {
            const wrapper = createWrapper({ currentIndex: 0, totalImages: 5 });
            expect(wrapper.find('[data-testid="chevron-right"]').exists()).toBe(true);
        });

        it('shows next button at intermediate index', () => {
            const wrapper = createWrapper({ currentIndex: 2, totalImages: 5 });
            expect(wrapper.find('[data-testid="chevron-right"]').exists()).toBe(true);
        });
    });

    describe('edge cases', () => {
        it('hides both buttons when there is only one image', () => {
            const wrapper = createWrapper({ currentIndex: 0, totalImages: 1 });
            expect(wrapper.find('[data-testid="chevron-left"]').exists()).toBe(false);
            expect(wrapper.find('[data-testid="chevron-right"]').exists()).toBe(false);
        });

        it('shows both buttons when in the middle of the list', () => {
            const wrapper = createWrapper({ currentIndex: 2, totalImages: 5 });
            expect(wrapper.find('[data-testid="chevron-left"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="chevron-right"]').exists()).toBe(true);
        });
    });

    describe('emitting events', () => {
        it('emits prev when prev button is clicked', async () => {
            const wrapper = createWrapper({ currentIndex: 2, totalImages: 5 });
            const prevButton = wrapper.findAll('button')[0];
            await prevButton.trigger('click');
            expect(wrapper.emitted('prev')).toBeTruthy();
            expect(wrapper.emitted('prev')).toHaveLength(1);
        });

        it('emits next when next button is clicked', async () => {
            const wrapper = createWrapper({ currentIndex: 2, totalImages: 5 });
            const buttons = wrapper.findAll('button');
            const nextButton = buttons[buttons.length - 1];
            await nextButton.trigger('click');
            expect(wrapper.emitted('next')).toBeTruthy();
            expect(wrapper.emitted('next')).toHaveLength(1);
        });
    });
});
