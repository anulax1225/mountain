import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

export function useDialog(options = {}) {
    const {
        closeOnEscape = true,
        closeOnClickOutside = false,
        onOpen = null,
        onClose = null,
        trapFocus = true
    } = options;

    const isOpen = ref(false);
    const previousFocus = ref(null);
    const dialogElement = ref(null);

    const open = () => {
        if (isOpen.value) return;

        // Store current focus
        previousFocus.value = document.activeElement;
        
        isOpen.value = true;

        if (onOpen) {
            onOpen();
        }

        // Add overflow hidden to body
        document.body.style.overflow = 'hidden';
    };

    const close = () => {
        if (!isOpen.value) return;

        isOpen.value = false;

        if (onClose) {
            onClose();
        }

        // Restore body overflow
        document.body.style.overflow = '';

        // Restore previous focus
        if (previousFocus.value && previousFocus.value.focus) {
            previousFocus.value.focus();
        }
    };

    const toggle = () => {
        if (isOpen.value) {
            close();
        } else {
            open();
        }
    };

    // Handle escape key
    const handleKeydown = (event) => {
        if (event.key === 'Escape' && closeOnEscape && isOpen.value) {
            close();
            event.preventDefault();
        }

        // Trap focus within dialog
        if (trapFocus && isOpen.value && event.key === 'Tab' && dialogElement.value) {
            const focusableElements = dialogElement.value.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    };

    // Handle click outside
    const handleClickOutside = (event) => {
        if (!closeOnClickOutside || !isOpen.value || !dialogElement.value) return;

        const dialogContent = dialogElement.value.querySelector('[role="dialog"]');
        if (dialogContent && !dialogContent.contains(event.target)) {
            close();
        }
    };

    onMounted(() => {
        document.addEventListener('keydown', handleKeydown);
        if (closeOnClickOutside) {
            document.addEventListener('mousedown', handleClickOutside);
        }
    });

    onUnmounted(() => {
        document.removeEventListener('keydown', handleKeydown);
        if (closeOnClickOutside) {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        
        // Cleanup on unmount
        if (isOpen.value) {
            document.body.style.overflow = '';
        }
    });

    // Watch for open state changes
    watch(isOpen, (newValue) => {
        if (newValue && trapFocus && dialogElement.value) {
            // Focus first focusable element in dialog
            setTimeout(() => {
                const focusableElements = dialogElement.value?.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                
                if (focusableElements && focusableElements.length > 0) {
                    focusableElements[0].focus();
                }
            }, 100);
        }
    });

    return {
        isOpen,
        open,
        close,
        toggle,
        dialogElement
    };
}

// Multiple dialog coordination
const openDialogs = ref([]);

export function useDialogStack() {
    const registerDialog = (dialogId) => {
        if (!openDialogs.value.includes(dialogId)) {
            openDialogs.value.push(dialogId);
        }
    };

    const unregisterDialog = (dialogId) => {
        const index = openDialogs.value.indexOf(dialogId);
        if (index > -1) {
            openDialogs.value.splice(index, 1);
        }
    };

    const isTopDialog = (dialogId) => {
        return openDialogs.value[openDialogs.value.length - 1] === dialogId;
    };

    const hasOpenDialogs = computed(() => openDialogs.value.length > 0);

    return {
        registerDialog,
        unregisterDialog,
        isTopDialog,
        hasOpenDialogs,
        openDialogs
    };
}
