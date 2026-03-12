import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';

vi.mock('@/composables', () => ({
    useConfirm: vi.fn(() => ({
        confirmDelete: vi.fn().mockResolvedValue(true),
    })),
}));

import ProjectShow from '@/pages/dashboard/ProjectShow.vue';

describe('ProjectShow', () => {
    const stubs = {
        DashboardLayout: { template: '<div data-testid="dashboard-layout"><slot /></div>' },
        SceneCard: { template: '<div data-testid="scene-card">{{ scene.name }}</div>', props: ['scene', 'canEdit'] },
        CreateSceneCard: { template: '<div data-testid="create-scene-card" />' },
        SceneFormSheet: { template: '<div data-testid="scene-form-sheet" />', props: ['open', 'editingScene', 'form'] },
        ProjectSettingsDialog: { template: '<div data-testid="settings-dialog" />', props: ['open', 'project', 'images'] },
        ProjectUsersDialog: { template: '<div data-testid="users-dialog" />', props: ['open', 'project', 'assignedUsers', 'availableUsers', 'availableRoles'] },
        ProjectEditDialog: { template: '<div data-testid="edit-dialog" />', props: ['open', 'project'] },
        ProjectShareDialog: { template: '<div data-testid="share-dialog" />', props: ['open', 'project'] },
        Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
        ArrowLeft: { template: '<span />' },
        Settings: { template: '<span />' },
        Users: { template: '<span />' },
        Edit: { template: '<span />' },
        Share2: { template: '<span />' },
        Globe: { template: '<span />' },
        BarChart3: { template: '<span />' },
    };

    const defaultProps = {
        auth: { user: { name: 'Test User' } },
        project: {
            slug: 'my-project',
            name: 'My Test Project',
            description: 'A test project',
            is_public: false,
            permissions: {
                can_edit: true,
                can_delete: true,
                can_manage_users: true,
                can_manage_settings: true,
                is_owner: true,
            },
        },
        scenes: {
            data: [
                { slug: 'scene-1', name: 'Scene One' },
                { slug: 'scene-2', name: 'Scene Two' },
            ],
        },
        projectImages: [],
        assignedUsers: [],
        availableUsers: [],
        availableRoles: [],
    };

    const mountComponent = (props = {}) => {
        return mount(ProjectShow, {
            props: { ...defaultProps, ...props },
            global: { stubs },
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the project name', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('h1').text()).toBe('My Test Project');
    });

    it('renders the project description', () => {
        const wrapper = mountComponent();
        expect(wrapper.text()).toContain('A test project');
    });

    it('renders scene cards from scenes.data', () => {
        const wrapper = mountComponent();
        const cards = wrapper.findAll('[data-testid="scene-card"]');
        expect(cards).toHaveLength(2);
        expect(cards[0].text()).toContain('Scene One');
        expect(cards[1].text()).toContain('Scene Two');
    });

    it('renders the "Scenes" section heading', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('h2').text()).toContain('Scènes');
    });

    it('shows edit button when user can edit', () => {
        const wrapper = mountComponent();
        expect(wrapper.text()).toContain('Modifier');
    });

    it('hides edit button when user cannot edit', () => {
        const wrapper = mountComponent({
            project: {
                ...defaultProps.project,
                permissions: { ...defaultProps.project.permissions, can_edit: false },
            },
        });
        expect(wrapper.text()).not.toContain('Modifier');
    });

    it('shows users button when user can manage users', () => {
        const wrapper = mountComponent();
        expect(wrapper.text()).toContain('Utilisateurs');
    });

    it('hides users button when user cannot manage users', () => {
        const wrapper = mountComponent({
            project: {
                ...defaultProps.project,
                permissions: { ...defaultProps.project.permissions, can_manage_users: false },
            },
        });
        expect(wrapper.text()).not.toContain('Utilisateurs');
    });

    it('shows settings button when user can manage settings', () => {
        const wrapper = mountComponent();
        expect(wrapper.text()).toContain('Paramètres');
    });

    it('hides settings button when user cannot manage settings', () => {
        const wrapper = mountComponent({
            project: {
                ...defaultProps.project,
                permissions: { ...defaultProps.project.permissions, can_manage_settings: false },
            },
        });
        expect(wrapper.text()).not.toContain('Paramètres');
    });

    it('shows share button when project is public', () => {
        const wrapper = mountComponent({
            project: { ...defaultProps.project, is_public: true },
        });
        expect(wrapper.text()).toContain('Partager');
    });

    it('hides share button when project is not public', () => {
        const wrapper = mountComponent();
        expect(wrapper.text()).not.toContain('Partager');
    });

    it('shows create scene card when user can edit', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('[data-testid="create-scene-card"]').exists()).toBe(true);
    });

    it('hides create scene card when user cannot edit', () => {
        const wrapper = mountComponent({
            project: {
                ...defaultProps.project,
                permissions: { ...defaultProps.project.permissions, can_edit: false },
            },
        });
        expect(wrapper.find('[data-testid="create-scene-card"]').exists()).toBe(false);
    });

    it('renders the SceneFormSheet component', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('[data-testid="scene-form-sheet"]').exists()).toBe(true);
    });

    it('renders with empty scenes list', () => {
        const wrapper = mountComponent({
            scenes: { data: [] },
        });
        const cards = wrapper.findAll('[data-testid="scene-card"]');
        expect(cards).toHaveLength(0);
    });
});
