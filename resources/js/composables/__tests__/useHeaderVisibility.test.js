import { describe, it, expect, beforeEach } from 'vitest';
import { useHeaderVisibility } from '@/composables/useHeaderVisibility';

describe('useHeaderVisibility', () => {
    // Get a reference to the shared singleton ref via the composable.
    // Since isVisible is module-level, all calls return the same ref.
    let sharedIsVisible;

    beforeEach(() => {
        localStorage.clear();
        // Reset the module-level singleton by getting a handle on it
        // and setting it to null so getInitialState runs fresh.
        if (sharedIsVisible) {
            sharedIsVisible.value = null;
        }
    });

    it('defaults to true when no localStorage value exists', () => {
        const { isVisible } = useHeaderVisibility();
        sharedIsVisible = isVisible;
        expect(isVisible.value).toBe(true);
    });

    it('show sets isVisible to true', () => {
        const { show, isVisible } = useHeaderVisibility();
        sharedIsVisible = isVisible;
        isVisible.value = false;
        show();
        expect(isVisible.value).toBe(true);
    });

    it('hide sets isVisible to false', () => {
        const { hide, isVisible } = useHeaderVisibility();
        sharedIsVisible = isVisible;
        isVisible.value = true;
        hide();
        expect(isVisible.value).toBe(false);
    });

    it('toggle flips the value from true to false', () => {
        const { toggle, isVisible } = useHeaderVisibility();
        sharedIsVisible = isVisible;
        isVisible.value = true;
        toggle();
        expect(isVisible.value).toBe(false);
    });

    it('toggle flips the value from false to true', () => {
        const { toggle, isVisible } = useHeaderVisibility();
        sharedIsVisible = isVisible;
        isVisible.value = false;
        toggle();
        expect(isVisible.value).toBe(true);
    });

    it('persists to localStorage on change', async () => {
        const { hide, isVisible } = useHeaderVisibility('headerVisible', true);
        sharedIsVisible = isVisible;

        hide();

        // The watcher is async, wait for it to flush
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(localStorage.getItem('headerVisible')).toBe('false');
    });

    it('reads initial value from localStorage', () => {
        localStorage.setItem('headerVisible', 'false');
        const { isVisible } = useHeaderVisibility('headerVisible', true);
        sharedIsVisible = isVisible;
        expect(isVisible.value).toBe(false);
    });
});
