import { describe, it, expect, beforeEach, vi } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    })),
});

import { useTheme } from '@/composables/useTheme';

describe('useTheme', () => {
    let themeApi;

    beforeEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('dark');
        document.documentElement.removeAttribute('style');
        document.body.classList.remove('bg-solid', 'bg-gradient', 'bg-radial', 'bg-mesh');
        themeApi = useTheme();
        // Reset singleton refs to defaults
        themeApi.theme.value = 'system';
        themeApi.isDark.value = false;
        themeApi.primaryHue.value = 286;
        themeApi.secondaryHue.value = 286;
        themeApi.intensity.value = 100;
        themeApi.radius.value = 0.625;
        themeApi.fontFamily.value = 'instrument-sans';
    });

    describe('setTheme', () => {
        it('adds dark class to documentElement and sets isDark=true for dark theme', () => {
            themeApi.setTheme('dark');

            expect(document.documentElement.classList.contains('dark')).toBe(true);
            expect(themeApi.isDark.value).toBe(true);
            expect(themeApi.theme.value).toBe('dark');
        });

        it('removes dark class and sets isDark=false for light theme', () => {
            // Start with dark
            themeApi.setTheme('dark');
            expect(document.documentElement.classList.contains('dark')).toBe(true);

            themeApi.setTheme('light');

            expect(document.documentElement.classList.contains('dark')).toBe(false);
            expect(themeApi.isDark.value).toBe(false);
            expect(themeApi.theme.value).toBe('light');
        });
    });

    describe('setPrimaryHue', () => {
        it('clamps value to 0-360 range', () => {
            themeApi.setPrimaryHue(-10);
            expect(themeApi.primaryHue.value).toBe(0);

            themeApi.setPrimaryHue(400);
            expect(themeApi.primaryHue.value).toBe(360);

            themeApi.setPrimaryHue(180);
            expect(themeApi.primaryHue.value).toBe(180);
        });
    });

    describe('setRadius', () => {
        it('clamps value to 0-2 range', () => {
            themeApi.setRadius(-1);
            expect(themeApi.radius.value).toBe(0);

            themeApi.setRadius(5);
            expect(themeApi.radius.value).toBe(2);

            themeApi.setRadius(1.5);
            expect(themeApi.radius.value).toBe(1.5);
        });
    });

    describe('setIntensity', () => {
        it('clamps value to 0-100 range', () => {
            themeApi.setIntensity(-10);
            expect(themeApi.intensity.value).toBe(0);

            themeApi.setIntensity(150);
            expect(themeApi.intensity.value).toBe(100);

            themeApi.setIntensity(50);
            expect(themeApi.intensity.value).toBe(50);
        });
    });

    describe('setFontFamily', () => {
        it('only accepts known font keys', () => {
            themeApi.setFontFamily('inter');
            expect(themeApi.fontFamily.value).toBe('inter');

            // Unknown key should be ignored
            themeApi.setFontFamily('comic-sans');
            expect(themeApi.fontFamily.value).toBe('inter');
        });
    });

    describe('FONT_STACKS', () => {
        it('has expected keys', () => {
            const expectedKeys = [
                'instrument-sans',
                'inter',
                'nunito',
                'poppins',
                'dm-sans',
                'system',
            ];

            expect(Object.keys(themeApi.FONT_STACKS)).toEqual(
                expect.arrayContaining(expectedKeys),
            );
            expect(Object.keys(themeApi.FONT_STACKS).length).toBe(expectedKeys.length);
        });
    });

    describe('initTheme', () => {
        it('loads theme from localStorage', () => {
            localStorage.setItem('theme', 'dark');

            themeApi.initTheme();

            expect(themeApi.theme.value).toBe('dark');
            expect(themeApi.isDark.value).toBe(true);
        });

        it('defaults to system when no stored theme', () => {
            themeApi.initTheme();

            expect(themeApi.theme.value).toBe('system');
        });

        it('loads primary hue from localStorage', () => {
            localStorage.setItem('primaryHue', '120');

            themeApi.initTheme();

            expect(themeApi.primaryHue.value).toBe(120);
        });
    });
});
