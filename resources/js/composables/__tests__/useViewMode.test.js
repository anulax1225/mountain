import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { useViewMode } from '../useViewMode';

describe('useViewMode', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    describe('default state', () => {
        it('has "grid" as default viewMode', () => {
            const { viewMode } = useViewMode();
            expect(viewMode.value).toBe('grid');
        });
    });

    describe('setViewMode', () => {
        it('changes the view mode', () => {
            const { viewMode, setViewMode } = useViewMode();
            setViewMode('list');
            expect(viewMode.value).toBe('list');
        });

        it('ignores an invalid mode', () => {
            const { viewMode, setViewMode } = useViewMode();
            setViewMode('invalid');
            expect(viewMode.value).toBe('grid');
        });
    });

    describe('toggleViewMode', () => {
        it('cycles grid -> list -> slider -> grid', () => {
            const { viewMode, toggleViewMode } = useViewMode();

            expect(viewMode.value).toBe('grid');

            toggleViewMode();
            expect(viewMode.value).toBe('list');

            toggleViewMode();
            expect(viewMode.value).toBe('slider');

            toggleViewMode();
            expect(viewMode.value).toBe('grid');
        });
    });

    describe('computed booleans', () => {
        it('isGrid is true when mode is grid', () => {
            const { isGrid, isList, isSlider } = useViewMode();
            expect(isGrid.value).toBe(true);
            expect(isList.value).toBe(false);
            expect(isSlider.value).toBe(false);
        });

        it('isList is true when mode is list', () => {
            const { isList, setViewMode } = useViewMode();
            setViewMode('list');
            expect(isList.value).toBe(true);
        });

        it('isSlider is true when mode is slider', () => {
            const { isSlider, setViewMode } = useViewMode();
            setViewMode('slider');
            expect(isSlider.value).toBe(true);
        });
    });

    describe('getViewModeLabel', () => {
        it('returns "Grille" for grid', () => {
            const { getViewModeLabel } = useViewMode();
            expect(getViewModeLabel.value).toBe('Grille');
        });

        it('returns "Liste" for list', () => {
            const { getViewModeLabel, setViewMode } = useViewMode();
            setViewMode('list');
            expect(getViewModeLabel.value).toBe('Liste');
        });

        it('returns "Carrousel" for slider', () => {
            const { getViewModeLabel, setViewMode } = useViewMode();
            setViewMode('slider');
            expect(getViewModeLabel.value).toBe('Carrousel');
        });
    });

    describe('getViewModeIcon', () => {
        it('returns "LayoutGrid" for grid', () => {
            const { getViewModeIcon } = useViewMode();
            expect(getViewModeIcon.value).toBe('LayoutGrid');
        });

        it('returns "List" for list', () => {
            const { getViewModeIcon, setViewMode } = useViewMode();
            setViewMode('list');
            expect(getViewModeIcon.value).toBe('List');
        });

        it('returns "Rows" for slider', () => {
            const { getViewModeIcon, setViewMode } = useViewMode();
            setViewMode('slider');
            expect(getViewModeIcon.value).toBe('Rows');
        });
    });

    describe('localStorage persistence', () => {
        it('persists view mode to localStorage', async () => {
            const { setViewMode } = useViewMode('testViewMode');
            setViewMode('list');
            await nextTick();
            expect(localStorage.getItem('testViewMode')).toBe('list');
        });

        it('loads view mode from localStorage on init', () => {
            localStorage.setItem('testViewMode', 'slider');
            const { viewMode } = useViewMode('testViewMode');
            expect(viewMode.value).toBe('slider');
        });

        it('ignores invalid value in localStorage', () => {
            localStorage.setItem('testViewMode', 'invalid');
            const { viewMode } = useViewMode('testViewMode');
            expect(viewMode.value).toBe('grid');
        });
    });
});
