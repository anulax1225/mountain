import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { useForm } from '@inertiajs/vue3';
import ProjectUserManager from '@/components/dashboard/ProjectUserManager.vue';

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

vi.mock('@/components/ui/label', () => ({
    Label: {
        name: 'Label',
        template: '<label><slot /></label>',
        props: ['for'],
    },
}));

vi.mock('@/components/ui/select', () => ({
    Select: {
        name: 'Select',
        template: '<div data-testid="select"><slot /></div>',
        props: ['modelValue', 'required'],
    },
    SelectContent: {
        name: 'SelectContent',
        template: '<div><slot /></div>',
    },
    SelectItem: {
        name: 'SelectItem',
        template: '<div data-testid="select-item"><slot /></div>',
        props: ['value'],
    },
    SelectTrigger: {
        name: 'SelectTrigger',
        template: '<div><slot /></div>',
        props: ['id'],
    },
    SelectValue: {
        name: 'SelectValue',
        template: '<span />',
        props: ['placeholder'],
    },
}));

vi.mock('@/components/ui/table', () => ({
    Table: {
        name: 'Table',
        template: '<table data-testid="table"><slot /></table>',
    },
    TableBody: {
        name: 'TableBody',
        template: '<tbody><slot /></tbody>',
    },
    TableCell: {
        name: 'TableCell',
        template: '<td><slot /></td>',
    },
    TableHead: {
        name: 'TableHead',
        template: '<th><slot /></th>',
    },
    TableHeader: {
        name: 'TableHeader',
        template: '<thead><slot /></thead>',
    },
    TableRow: {
        name: 'TableRow',
        template: '<tr><slot /></tr>',
    },
}));

vi.mock('@/components/ui/badge', () => ({
    Badge: {
        name: 'Badge',
        template: '<span data-testid="badge" :data-variant="variant"><slot /></span>',
        props: ['variant'],
    },
}));

vi.mock('lucide-vue-next', () => ({
    UserPlus: {
        name: 'UserPlus',
        template: '<span data-testid="user-plus-icon" />',
    },
    X: {
        name: 'X',
        template: '<span data-testid="x-icon" />',
    },
}));

describe('ProjectUserManager', () => {
    let mockAddForm;
    let mockRemoveForm;
    let useFormCallCount;

    const roles = [
        { id: 1, name: 'Administrateur', slug: 'admin' },
        { id: 2, name: 'Client', slug: 'client' },
        { id: 3, name: 'Viewer', slug: 'viewer' },
    ];

    const assignedUsers = [
        { id: 1, name: 'Alice', email: 'alice@test.com', pivot: { role_id: 1 }, roles: [] },
        { id: 2, name: 'Bob', email: 'bob@test.com', pivot: { role_id: 2 }, roles: [] },
    ];

    const availableUsers = [
        { id: 3, name: 'Charlie', email: 'charlie@test.com', roles: [] },
    ];

    beforeEach(() => {
        useFormCallCount = 0;

        mockAddForm = {
            user_id: '',
            role_id: '',
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

        mockRemoveForm = {
            user_id: null,
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

        vi.mocked(useForm).mockImplementation((data) => {
            useFormCallCount++;
            // First call is addForm, second is removeForm
            if (useFormCallCount === 1) {
                return mockAddForm;
            }
            return mockRemoveForm;
        });
    });

    function createWrapper(props = {}) {
        // Reset call count so each wrapper gets fresh forms
        useFormCallCount = 0;
        return mount(ProjectUserManager, {
            props: {
                projectSlug: 'test-project',
                assignedUsers,
                availableUsers,
                roles,
                ...props,
            },
        });
    }

    describe('rendering', () => {
        it('renders the card title', () => {
            const wrapper = createWrapper();
            expect(wrapper.find('[data-testid="card-title"]').text()).toContain('Utilisateurs assign');
        });

        it('renders the card description', () => {
            const wrapper = createWrapper();
            expect(wrapper.find('[data-testid="card-description"]').text()).toContain('acc');
        });

        it('renders the add button when form is not shown', () => {
            const wrapper = createWrapper();
            expect(wrapper.find('[data-testid="user-plus-icon"]').exists()).toBe(true);
        });
    });

    describe('assigned users table', () => {
        it('renders the table when there are assigned users', () => {
            const wrapper = createWrapper();
            expect(wrapper.find('[data-testid="table"]').exists()).toBe(true);
        });

        it('renders a row for each assigned user', () => {
            const wrapper = createWrapper();
            const rows = wrapper.findAll('tbody tr');
            expect(rows).toHaveLength(2);
        });

        it('displays user names in the table', () => {
            const wrapper = createWrapper();
            const cells = wrapper.findAll('tbody td');
            const cellTexts = cells.map((c) => c.text());
            expect(cellTexts).toContain('Alice');
            expect(cellTexts).toContain('Bob');
        });

        it('displays user emails in the table', () => {
            const wrapper = createWrapper();
            const cells = wrapper.findAll('tbody td');
            const cellTexts = cells.map((c) => c.text());
            expect(cellTexts).toContain('alice@test.com');
            expect(cellTexts).toContain('bob@test.com');
        });

        it('displays role badges for assigned users', () => {
            const wrapper = createWrapper();
            const badges = wrapper.findAll('[data-testid="badge"]');
            expect(badges).toHaveLength(2);
            expect(badges[0].text()).toBe('Administrateur');
            expect(badges[1].text()).toBe('Client');
        });
    });

    describe('empty state', () => {
        it('shows empty message when no users are assigned', () => {
            const wrapper = createWrapper({ assignedUsers: [] });
            expect(wrapper.text()).toContain('Aucun utilisateur assign');
        });

        it('does not render table when no users are assigned', () => {
            const wrapper = createWrapper({ assignedUsers: [] });
            expect(wrapper.find('[data-testid="table"]').exists()).toBe(false);
        });
    });

    describe('add form visibility', () => {
        it('does not show the add form initially', () => {
            const wrapper = createWrapper();
            expect(wrapper.find('form').exists()).toBe(false);
        });

        it('shows the add form when add button is clicked', async () => {
            const wrapper = createWrapper();
            // The add button has the UserPlus icon
            const addButton = wrapper.findAll('button').find((b) => b.find('[data-testid="user-plus-icon"]').exists());
            await addButton.trigger('click');
            expect(wrapper.find('form').exists()).toBe(true);
        });

        it('hides the add button when form is shown', async () => {
            const wrapper = createWrapper();
            const addButton = wrapper.findAll('button').find((b) => b.find('[data-testid="user-plus-icon"]').exists());
            await addButton.trigger('click');
            // After clicking, the UserPlus icon button should be hidden
            expect(wrapper.findAll('button').find((b) => b.find('[data-testid="user-plus-icon"]').exists())).toBeUndefined();
        });

        it('hides the add form when cancel button is clicked', async () => {
            const wrapper = createWrapper();
            const addButton = wrapper.findAll('button').find((b) => b.find('[data-testid="user-plus-icon"]').exists());
            await addButton.trigger('click');
            expect(wrapper.find('form').exists()).toBe(true);

            // Click the cancel button within the form
            const cancelButton = wrapper.findAll('form button').find((b) => b.text() === 'Annuler');
            await cancelButton.trigger('click');
            expect(wrapper.find('form').exists()).toBe(false);
        });
    });

    describe('getRoleName helper', () => {
        it('returns role name for admin role', () => {
            const wrapper = createWrapper({
                assignedUsers: [{ id: 1, name: 'Alice', email: 'a@t.com', pivot: { role_id: 1 }, roles: [] }],
            });
            const badge = wrapper.find('[data-testid="badge"]');
            expect(badge.text()).toBe('Administrateur');
        });

        it('returns role name for client role', () => {
            const wrapper = createWrapper({
                assignedUsers: [{ id: 1, name: 'Alice', email: 'a@t.com', pivot: { role_id: 2 }, roles: [] }],
            });
            const badge = wrapper.find('[data-testid="badge"]');
            expect(badge.text()).toBe('Client');
        });

        it('returns Inconnu for unknown role id', () => {
            const wrapper = createWrapper({
                assignedUsers: [{ id: 1, name: 'Alice', email: 'a@t.com', pivot: { role_id: 999 }, roles: [] }],
            });
            const badge = wrapper.find('[data-testid="badge"]');
            expect(badge.text()).toBe('Inconnu');
        });
    });

    describe('getRoleBadgeVariant helper', () => {
        it('returns default variant for admin role', () => {
            const wrapper = createWrapper({
                assignedUsers: [{ id: 1, name: 'Alice', email: 'a@t.com', pivot: { role_id: 1 }, roles: [] }],
            });
            const badge = wrapper.find('[data-testid="badge"]');
            expect(badge.attributes('data-variant')).toBe('default');
        });

        it('returns secondary variant for client role', () => {
            const wrapper = createWrapper({
                assignedUsers: [{ id: 1, name: 'Alice', email: 'a@t.com', pivot: { role_id: 2 }, roles: [] }],
            });
            const badge = wrapper.find('[data-testid="badge"]');
            expect(badge.attributes('data-variant')).toBe('secondary');
        });

        it('returns outline variant for unknown role', () => {
            const wrapper = createWrapper({
                assignedUsers: [{ id: 1, name: 'Alice', email: 'a@t.com', pivot: { role_id: 999 }, roles: [] }],
            });
            const badge = wrapper.find('[data-testid="badge"]');
            expect(badge.attributes('data-variant')).toBe('outline');
        });

        it('returns outline variant for viewer role', () => {
            const wrapper = createWrapper({
                assignedUsers: [{ id: 1, name: 'Alice', email: 'a@t.com', pivot: { role_id: 3 }, roles: [] }],
            });
            const badge = wrapper.find('[data-testid="badge"]');
            expect(badge.attributes('data-variant')).toBe('outline');
        });
    });

    describe('remove user', () => {
        it('renders remove button for each user', () => {
            const wrapper = createWrapper();
            const xIcons = wrapper.findAll('[data-testid="x-icon"]');
            expect(xIcons).toHaveLength(2);
        });
    });
});
