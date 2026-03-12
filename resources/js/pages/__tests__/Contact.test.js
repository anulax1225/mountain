import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Contact from '@/pages/Contact.vue';

describe('Contact', () => {
    const stubs = {
        LandingLayout: { template: '<div data-testid="landing-layout"><slot /></div>' },
        Button: { template: '<button :disabled="$attrs.disabled" :type="$attrs.type"><slot /></button>' },
        Input: { template: '<input :id="$attrs.id" :type="$attrs.type" />', props: ['modelValue'] },
        Label: { template: '<label :for="$attrs.for"><slot /></label>' },
        Textarea: { template: '<textarea :id="$attrs.id" />', props: ['modelValue'] },
        Mail: { template: '<span />' },
        Phone: { template: '<span />' },
        Building2: { template: '<span />' },
        Send: { template: '<span />' },
        CheckCircle: { template: '<span />' },
    };

    const mountComponent = () => {
        return mount(Contact, {
            global: { stubs },
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the contact page heading', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('h1').text()).toBe('Contactez-nous');
    });

    it('renders the form section heading', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('h2').text()).toBe('Envoyez-nous un message');
    });

    it('renders the subtitle text', () => {
        const wrapper = mountComponent();
        expect(wrapper.text()).toContain('Une question sur nos services');
    });

    it('has a name input field', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('input[id="name"]').exists()).toBe(true);
    });

    it('has an email input field', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('input[id="email"]').exists()).toBe(true);
    });

    it('has a phone input field', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('input[id="phone"]').exists()).toBe(true);
    });

    it('has a company input field', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('input[id="company"]').exists()).toBe(true);
    });

    it('has a message textarea field', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('textarea[id="message"]').exists()).toBe(true);
    });

    it('renders a submit button', () => {
        const wrapper = mountComponent();
        const submitButton = wrapper.find('button[type="submit"]');
        expect(submitButton.exists()).toBe(true);
        expect(submitButton.text()).toContain('Envoyer le message');
    });

    it('renders the LandingLayout', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('[data-testid="landing-layout"]').exists()).toBe(true);
    });

    it('renders contact information section', () => {
        const wrapper = mountComponent();
        expect(wrapper.text()).toContain('Informations de contact');
    });

    it('does not show success message initially', () => {
        const wrapper = mountComponent();
        expect(wrapper.text()).not.toContain('Message envoyé avec succès');
    });

    it('renders the form element', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('form').exists()).toBe(true);
    });

    it('renders all required field labels', () => {
        const wrapper = mountComponent();
        expect(wrapper.text()).toContain('Nom complet');
        expect(wrapper.text()).toContain('Email');
        expect(wrapper.text()).toContain('Téléphone');
        expect(wrapper.text()).toContain('Entreprise');
        expect(wrapper.text()).toContain('Message');
    });
});
