import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';

vi.mock('@/composables', () => ({
    useConfirm: vi.fn(() => ({
        confirmDelete: vi.fn().mockResolvedValue(true),
    })),
}));

import DashboardIndex from '@/pages/dashboard/Index.vue';

describe('Dashboard Index', () => {
    const stubs = {
        DashboardLayout: { template: '<div data-testid="dashboard-layout"><slot /></div>' },
        ProjectCard: { template: '<div data-testid="project-card">{{ project.name }}</div>', props: ['project'] },
        CreateProjectCard: { template: '<div data-testid="create-project-card" />' },
        DropzoneUpload: true,
        Sheet: { template: '<div><slot /></div>' },
        SheetContent: { template: '<div><slot /></div>' },
        SheetHeader: { template: '<div><slot /></div>' },
        SheetTitle: { template: '<div><slot /></div>' },
        SheetDescription: { template: '<div><slot /></div>' },
        Button: { template: '<button :disabled="$attrs.disabled"><slot /></button>' },
        Input: { template: '<input />', props: ['modelValue'] },
        Label: { template: '<label><slot /></label>' },
        Textarea: { template: '<textarea />', props: ['modelValue'] },
    };

    const defaultProps = {
        auth: {
            user: {
                can_create_projects: true,
            },
        },
        projects: {
            data: [
                { slug: 'project-1', name: 'Project Alpha', description: 'First project' },
                { slug: 'project-2', name: 'Project Beta', description: 'Second project' },
            ],
        },
    };

    const mountComponent = (props = {}) => {
        return mount(DashboardIndex, {
            props: { ...defaultProps, ...props },
            global: { stubs },
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the "Projets" heading', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('h1').text()).toBe('Projets');
    });

    it('renders the subtitle text', () => {
        const wrapper = mountComponent();
        expect(wrapper.text()).toContain('Gérez vos projets de visite virtuelle');
    });

    it('renders project cards from projects.data', () => {
        const wrapper = mountComponent();
        const cards = wrapper.findAll('[data-testid="project-card"]');
        expect(cards).toHaveLength(2);
        expect(cards[0].text()).toContain('Project Alpha');
        expect(cards[1].text()).toContain('Project Beta');
    });

    it('shows create project card when user can create projects', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('[data-testid="create-project-card"]').exists()).toBe(true);
    });

    it('hides create project card when user cannot create projects', () => {
        const wrapper = mountComponent({
            auth: { user: { can_create_projects: false } },
        });
        expect(wrapper.find('[data-testid="create-project-card"]').exists()).toBe(false);
    });

    it('renders empty list when no projects', () => {
        const wrapper = mountComponent({
            projects: { data: [] },
        });
        const cards = wrapper.findAll('[data-testid="project-card"]');
        expect(cards).toHaveLength(0);
    });

    it('renders the DashboardLayout', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('[data-testid="dashboard-layout"]').exists()).toBe(true);
    });

    it('handles null auth user gracefully', () => {
        const wrapper = mountComponent({
            auth: { user: null },
        });
        expect(wrapper.find('[data-testid="create-project-card"]').exists()).toBe(false);
    });
});
