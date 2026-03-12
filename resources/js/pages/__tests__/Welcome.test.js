import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Welcome from '@/pages/Welcome.vue';

describe('Welcome', () => {
    const stubs = {
        LandingLayout: { template: '<div data-testid="landing-layout"><slot /></div>' },
        LandingHero: { template: '<div data-testid="landing-hero" />' },
        LandingFeatures: { template: '<div data-testid="landing-features" />' },
        LandingCTA: { template: '<div data-testid="landing-cta" />' },
    };

    const mountComponent = () => {
        return mount(Welcome, {
            global: { stubs },
        });
    };

    it('renders the LandingLayout', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('[data-testid="landing-layout"]').exists()).toBe(true);
    });

    it('renders the LandingHero component', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('[data-testid="landing-hero"]').exists()).toBe(true);
    });

    it('renders the LandingFeatures component', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('[data-testid="landing-features"]').exists()).toBe(true);
    });

    it('renders the LandingCTA component', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('[data-testid="landing-cta"]').exists()).toBe(true);
    });

    it('renders all child components inside the layout', () => {
        const wrapper = mountComponent();
        const layout = wrapper.find('[data-testid="landing-layout"]');
        expect(layout.find('[data-testid="landing-hero"]').exists()).toBe(true);
        expect(layout.find('[data-testid="landing-features"]').exists()).toBe(true);
        expect(layout.find('[data-testid="landing-cta"]').exists()).toBe(true);
    });
});
