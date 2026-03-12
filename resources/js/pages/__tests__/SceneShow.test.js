import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';

vi.mock('@/composables/useConfirm', () => ({
    useConfirm: vi.fn(() => ({
        confirmDelete: vi.fn().mockResolvedValue(true),
    })),
}));

vi.mock('@/composables/useFileDownload', () => ({
    useFileDownload: vi.fn(() => ({
        downloadBlob: vi.fn(),
    })),
}));

vi.mock('@/composables/useViewMode', () => ({
    useViewMode: vi.fn(() => ({
        viewMode: { value: 'grid' },
    })),
}));

vi.mock('@/owl-sdk.js', () => ({
    default: {
        images: {
            download: vi.fn(),
        },
    },
}));

import SceneShow from '@/pages/dashboard/SceneShow.vue';

describe('SceneShow', () => {
    const stubs = {
        DashboardLayout: { template: '<div data-testid="dashboard-layout"><slot /></div>' },
        EmptyState: { template: '<div data-testid="empty-state"><slot /></div>', props: ['icon', 'title', 'description'] },
        ImageCard: { template: '<div data-testid="image-card" />', props: ['image', 'sceneName', 'canEdit'] },
        ImageListItem: { template: '<div data-testid="image-list-item" />', props: ['image', 'sceneName', 'canEdit'] },
        ImageSlider: { template: '<div data-testid="image-slider" />', props: ['images', 'currentIndex', 'sceneName', 'canEdit'] },
        ImageThumbnails: { template: '<div data-testid="image-thumbnails" />', props: ['images', 'currentIndex', 'sceneName'] },
        ViewModeToggle: { template: '<div data-testid="view-mode-toggle" />', props: ['modelValue'] },
        ImageUploadSheet: { template: '<div data-testid="upload-sheet" />', props: ['open', 'sceneSlug'] },
        ImageDetailsSheet: { template: '<div data-testid="details-sheet" />', props: ['open', 'image', 'sceneName', 'canEdit'] },
        ImageFullscreen: { template: '<div data-testid="image-fullscreen" />', props: ['open', 'images', 'currentIndex', 'sceneName'] },
        Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
        ArrowLeft: { template: '<span />' },
        Upload: { template: '<span />' },
    };

    const defaultProps = {
        auth: { user: { name: 'Test User' } },
        scene: {
            slug: 'my-scene',
            name: 'My Test Scene',
            project: {
                slug: 'my-project',
                name: 'My Project',
                permissions: {
                    can_edit: true,
                },
            },
            images: [
                { slug: 'img-1', path: '/images/img1.jpg' },
                { slug: 'img-2', path: '/images/img2.jpg' },
                { slug: 'img-3', path: '/images/img3.jpg' },
            ],
        },
    };

    const mountComponent = (props = {}) => {
        return mount(SceneShow, {
            props: { ...defaultProps, ...props },
            global: { stubs },
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the scene name', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('h1').text()).toBe('My Test Scene');
    });

    it('shows the image count', () => {
        const wrapper = mountComponent();
        expect(wrapper.text()).toContain('3 image(s)');
    });

    it('shows upload button when user can edit', () => {
        const wrapper = mountComponent();
        expect(wrapper.text()).toContain('Ajouter des images');
    });

    it('hides upload button when user cannot edit', () => {
        const wrapper = mountComponent({
            scene: {
                ...defaultProps.scene,
                project: {
                    ...defaultProps.scene.project,
                    permissions: { can_edit: false },
                },
            },
        });
        // The main "Ajouter des images" button in the header should not be visible
        const buttons = wrapper.findAll('button');
        const uploadButtons = buttons.filter((b) => b.text().includes('Ajouter des images'));
        expect(uploadButtons).toHaveLength(0);
    });

    it('renders editor link with 360 text', () => {
        const wrapper = mountComponent();
        expect(wrapper.text()).toContain('Éditeur 360°');
    });

    it('renders the DashboardLayout', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('[data-testid="dashboard-layout"]').exists()).toBe(true);
    });

    it('shows empty state when there are no images', () => {
        const wrapper = mountComponent({
            scene: {
                ...defaultProps.scene,
                images: [],
            },
        });
        expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
    });

    it('shows image count as 0 when no images', () => {
        const wrapper = mountComponent({
            scene: {
                ...defaultProps.scene,
                images: [],
            },
        });
        expect(wrapper.text()).toContain('0 image(s)');
    });

    it('renders the upload sheet component', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('[data-testid="upload-sheet"]').exists()).toBe(true);
    });

    it('renders the image details sheet component', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('[data-testid="details-sheet"]').exists()).toBe(true);
    });
});
