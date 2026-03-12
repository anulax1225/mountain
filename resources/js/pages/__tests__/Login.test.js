import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { useForm } from '@inertiajs/vue3';
import Login from '@/pages/auth/Login.vue';

describe('Login', () => {
    const stubs = {
        AuthLayout: { template: '<div data-testid="auth-layout"><slot /></div>' },
        Button: { template: '<button :disabled="$attrs.disabled"><slot /></button>' },
        Input: { template: '<input :id="$attrs.id" :type="$attrs.type" />', props: ['modelValue'] },
        Label: { template: '<label :for="$attrs.for"><slot /></label>' },
    };

    const mountComponent = (props = {}) => {
        return mount(Login, {
            props,
            global: { stubs },
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the login heading', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('h2').text()).toBe('Bon retour');
    });

    it('renders the subtitle text', () => {
        const wrapper = mountComponent();
        expect(wrapper.text()).toContain('Connectez-vous à votre compte pour continuer');
    });

    it('renders the AuthLayout', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('[data-testid="auth-layout"]').exists()).toBe(true);
    });

    it('renders email and password input fields', () => {
        const wrapper = mountComponent();
        const emailInput = wrapper.find('input[id="email"]');
        const passwordInput = wrapper.find('input[id="password"]');

        expect(emailInput.exists()).toBe(true);
        expect(passwordInput.exists()).toBe(true);
    });

    it('renders email label', () => {
        const wrapper = mountComponent();
        expect(wrapper.text()).toContain('Email');
    });

    it('renders password label', () => {
        const wrapper = mountComponent();
        expect(wrapper.text()).toContain('Mot de passe');
    });

    it('renders submit button with correct text', () => {
        const wrapper = mountComponent();
        const button = wrapper.find('button[type="submit"]');
        expect(button.exists()).toBe(true);
        expect(button.text()).toBe('Se connecter');
    });

    it('shows status message when status prop is provided', () => {
        const wrapper = mountComponent({ status: 'Un lien de réinitialisation a été envoyé.' });
        expect(wrapper.text()).toContain('Un lien de réinitialisation a été envoyé.');
    });

    it('does not show status message when status prop is not provided', () => {
        const wrapper = mountComponent();
        const statusDiv = wrapper.find('.text-green-600');
        expect(statusDiv.exists()).toBe(false);
    });

    it('shows forgot password link when canResetPassword is true', () => {
        const wrapper = mountComponent({ canResetPassword: true });
        expect(wrapper.text()).toContain('Mot de passe oublié?');
    });

    it('hides forgot password link when canResetPassword is false', () => {
        const wrapper = mountComponent({ canResetPassword: false });
        expect(wrapper.text()).not.toContain('Mot de passe oublié?');
    });

    it('calls form.post on form submission', async () => {
        const wrapper = mountComponent();
        const form = wrapper.find('form');
        await form.trigger('submit.prevent');

        const mockForm = useForm.mock.results[0].value;
        expect(mockForm.post).toHaveBeenCalledWith('/login', expect.objectContaining({
            onFinish: expect.any(Function),
        }));
    });

    it('renders the form element', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('form').exists()).toBe(true);
    });
});
