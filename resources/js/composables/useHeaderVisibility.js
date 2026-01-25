import { ref, watch, computed } from 'vue'


const isVisible = ref(null);

/**
 * Composable for managing header visibility state with localStorage persistence
 *
 * @param {string} storageKey - Key for localStorage persistence
 * @param {boolean} defaultVisible - Default visibility state
 * @returns {Object} Header visibility state and methods
 */
export function useHeaderVisibility(storageKey = 'headerVisible', defaultVisible = true) {
    // Try to restore from localStorage
    const getInitialState = () => {
        if (typeof window === 'undefined') return defaultVisible

        try {
            const stored = localStorage.getItem(storageKey)
            return stored !== null ? JSON.parse(stored) : defaultVisible
        } catch (error) {
            console.warn('Failed to parse header visibility from localStorage:', error)
            return defaultVisible
        }
    }
    if(!isVisible.value) isVisible.value = getInitialState();

    // Persist to localStorage when state changes
    watch(isVisible, (newValue) => {
        if (typeof window === 'undefined') return

        try {
            localStorage.setItem(storageKey, JSON.stringify(newValue))
        } catch (error) {
            console.warn('Failed to save header visibility to localStorage:', error)
        }
    })

    /**
     * Show the header
     */
    const show = () => {
        isVisible.value = true
    }

    /**
     * Hide the header
     */
    const hide = () => {
        isVisible.value = false
    }

    /**
     * Toggle header visibility
     */
    const toggle = () => {
        isVisible.value = !isVisible.value
    }

    return {
        isVisible,
        show,
        hide,
        toggle
    }
}
