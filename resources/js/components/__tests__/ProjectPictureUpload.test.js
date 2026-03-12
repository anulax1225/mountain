import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { useForm } from '@inertiajs/vue3';
import ProjectPictureUpload from '@/components/dashboard/ProjectPictureUpload.vue';

vi.mock('@/components/ui/button', () => ({
    Button: {
        name: 'Button',
        template: '<button :type="type" :disabled="disabled"><slot /></button>',
        props: ['type', 'variant', 'size', 'disabled'],
    },
}));

vi.mock('@/components/ui/card', () => ({
    Card: {
        name: 'Card',
        template: '<div data-testid="card"><slot /></div>',
    },
    CardContent: {
        name: 'CardContent',
        template: '<div data-testid="card-content"><slot /></div>',
    },
    CardDescription: {
        name: 'CardDescription',
        template: '<p data-testid="card-description"><slot /></p>',
    },
    CardHeader: {
        name: 'CardHeader',
        template: '<div data-testid="card-header"><slot /></div>',
    },
    CardTitle: {
        name: 'CardTitle',
        template: '<h3 data-testid="card-title"><slot /></h3>',
    },
}));

vi.mock('@/components/ui/input', () => ({
    Input: {
        name: 'Input',
        template: '<input :id="id" :type="type" :accept="accept" />',
        props: ['id', 'type', 'accept', 'modelValue'],
    },
}));

vi.mock('@/components/ui/label', () => ({
    Label: {
        name: 'Label',
        template: '<label><slot /></label>',
        props: ['for'],
    },
}));

vi.mock('lucide-vue-next', () => ({
    Upload: {
        name: 'Upload',
        template: '<span data-testid="upload-icon" />',
    },
    X: {
        name: 'X',
        template: '<span data-testid="x-icon" />',
    },
}));

describe('ProjectPictureUpload', () => {
    let mockForm;

    beforeEach(() => {
        mockForm = {
            picture: null,
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
        };
        vi.mocked(useForm).mockReturnValue(mockForm);
    });

    function createWrapper(props = {}) {
        return mount(ProjectPictureUpload, {
            props: {
                projectSlug: 'test-project',
                ...props,
            },
        });
    }

    describe('rendering', () => {
        it('renders the card title', () => {
            const wrapper = createWrapper();
            expect(wrapper.find('[data-testid="card-title"]').text()).toBe('Image du projet');
        });

        it('renders the card description', () => {
            const wrapper = createWrapper();
            expect(wrapper.find('[data-testid="card-description"]').text()).toContain('image de couverture');
        });

        it('renders a file input', () => {
            const wrapper = createWrapper();
            expect(wrapper.find('input[type="file"]').exists()).toBe(true);
        });

        it('renders submit button', () => {
            const wrapper = createWrapper();
            expect(wrapper.find('button[type="submit"]').text()).toBe('Enregistrer');
        });
    });

    describe('without current picture', () => {
        it('does not render a preview image when no currentPicture', () => {
            const wrapper = createWrapper({ currentPicture: null });
            expect(wrapper.find('img').exists()).toBe(false);
        });
    });

    describe('with current picture', () => {
        it('renders a preview image when currentPicture is provided', () => {
            const wrapper = createWrapper({ currentPicture: 'images/photo.jpg' });
            const img = wrapper.find('img');
            expect(img.exists()).toBe(true);
            expect(img.attributes('src')).toBe('/storage/images/photo.jpg');
        });
    });

    describe('form submission', () => {
        it('calls form.post with the correct URL on submit', async () => {
            const wrapper = createWrapper({ projectSlug: 'my-project' });
            await wrapper.find('form').trigger('submit');
            expect(mockForm.post).toHaveBeenCalledWith(
                '/projects/my-project',
                expect.objectContaining({ forceFormData: true }),
            );
        });
    });

    describe('submit button disabled state', () => {
        it('disables submit button when processing', () => {
            mockForm.processing = true;
            const wrapper = createWrapper();
            expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
        });

        it('disables submit button when no picture is selected', () => {
            mockForm.picture = null;
            const wrapper = createWrapper();
            expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
        });
    });

    describe('useForm initialization', () => {
        it('calls useForm with picture: null', () => {
            createWrapper();
            expect(useForm).toHaveBeenCalledWith({ picture: null });
        });
    });
});
