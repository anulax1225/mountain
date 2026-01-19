import { ref, computed, watch } from 'vue';

export function useViewMode(storageKey = 'viewMode', defaultMode = 'grid', availableModes = ['grid', 'list', 'slider']) {
    const viewMode = ref(defaultMode);

    // Load from localStorage on initialization
    const loadFromStorage = () => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored && availableModes.includes(stored)) {
                viewMode.value = stored;
            }
        } catch (error) {
            console.warn('Failed to load view mode from localStorage:', error);
        }
    };

    // Save to localStorage when mode changes
    const saveToStorage = () => {
        try {
            localStorage.setItem(storageKey, viewMode.value);
        } catch (error) {
            console.warn('Failed to save view mode to localStorage:', error);
        }
    };

    // Initialize from storage
    loadFromStorage();

    // Watch for changes and persist
    watch(viewMode, saveToStorage);

    const setViewMode = (mode) => {
        if (availableModes.includes(mode)) {
            viewMode.value = mode;
        } else {
            console.warn(`Invalid view mode: ${mode}. Available modes:`, availableModes);
        }
    };

    const toggleViewMode = () => {
        const currentIndex = availableModes.indexOf(viewMode.value);
        const nextIndex = (currentIndex + 1) % availableModes.length;
        viewMode.value = availableModes[nextIndex];
    };

    const isGrid = computed(() => viewMode.value === 'grid');
    const isList = computed(() => viewMode.value === 'list');
    const isSlider = computed(() => viewMode.value === 'slider');

    const getViewModeIcon = computed(() => {
        const icons = {
            grid: 'LayoutGrid',
            list: 'List',
            slider: 'Rows'
        };
        return icons[viewMode.value] || 'LayoutGrid';
    });

    const getViewModeLabel = computed(() => {
        const labels = {
            grid: 'Grille',
            list: 'Liste',
            slider: 'Carrousel'
        };
        return labels[viewMode.value] || 'Grille';
    });

    return {
        viewMode,
        availableModes,
        setViewMode,
        toggleViewMode,
        isGrid,
        isList,
        isSlider,
        getViewModeIcon,
        getViewModeLabel
    };
}
