import { ref, computed, watch } from 'vue';

export function usePagination(options = {}) {
    const {
        initialPage = 1,
        initialPerPage = 10,
        total = 0,
        onPageChange = null,
        persistState = false,
        storageKey = 'pagination'
    } = options;

    const currentPage = ref(initialPage);
    const perPage = ref(initialPerPage);
    const totalItems = ref(total);

    // Load state from storage if enabled
    if (persistState) {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                currentPage.value = parsed.page || initialPage;
                perPage.value = parsed.perPage || initialPerPage;
            }
        } catch (error) {
            console.warn('Failed to load pagination state:', error);
        }
    }

    // Save state to storage when changes occur
    if (persistState) {
        watch([currentPage, perPage], () => {
            try {
                localStorage.setItem(storageKey, JSON.stringify({
                    page: currentPage.value,
                    perPage: perPage.value
                }));
            } catch (error) {
                console.warn('Failed to save pagination state:', error);
            }
        });
    }

    const totalPages = computed(() => {
        return Math.ceil(totalItems.value / perPage.value);
    });

    const offset = computed(() => {
        return (currentPage.value - 1) * perPage.value;
    });

    const hasNextPage = computed(() => {
        return currentPage.value < totalPages.value;
    });

    const hasPreviousPage = computed(() => {
        return currentPage.value > 1;
    });

    const isFirstPage = computed(() => currentPage.value === 1);
    const isLastPage = computed(() => currentPage.value === totalPages.value);

    const startItem = computed(() => {
        if (totalItems.value === 0) return 0;
        return offset.value + 1;
    });

    const endItem = computed(() => {
        const end = offset.value + perPage.value;
        return Math.min(end, totalItems.value);
    });

    const pageRange = computed(() => {
        const range = [];
        const delta = 2; // Number of pages to show on each side of current page
        const left = Math.max(2, currentPage.value - delta);
        const right = Math.min(totalPages.value - 1, currentPage.value + delta);

        // Always show first page
        range.push(1);

        // Add ellipsis if needed
        if (left > 2) {
            range.push('...');
        }

        // Add middle pages
        for (let i = left; i <= right; i++) {
            range.push(i);
        }

        // Add ellipsis if needed
        if (right < totalPages.value - 1) {
            range.push('...');
        }

        // Always show last page if more than 1 page
        if (totalPages.value > 1) {
            range.push(totalPages.value);
        }

        return range;
    });

    const goToPage = (page) => {
        if (page < 1 || page > totalPages.value) return;

        const oldPage = currentPage.value;
        currentPage.value = page;

        if (onPageChange) {
            onPageChange(page, oldPage);
        }
    };

    const nextPage = () => {
        if (hasNextPage.value) {
            goToPage(currentPage.value + 1);
        }
    };

    const previousPage = () => {
        if (hasPreviousPage.value) {
            goToPage(currentPage.value - 1);
        }
    };

    const firstPage = () => {
        goToPage(1);
    };

    const lastPage = () => {
        goToPage(totalPages.value);
    };

    const setPerPage = (newPerPage) => {
        perPage.value = newPerPage;
        // Reset to first page when changing items per page
        goToPage(1);
    };

    const setTotal = (newTotal) => {
        totalItems.value = newTotal;
        
        // Adjust current page if it's now out of bounds
        if (currentPage.value > totalPages.value && totalPages.value > 0) {
            goToPage(totalPages.value);
        }
    };

    const reset = () => {
        currentPage.value = initialPage;
        perPage.value = initialPerPage;
        totalItems.value = total;
    };

    const paginateArray = (array) => {
        const start = offset.value;
        const end = start + perPage.value;
        return array.slice(start, end);
    };

    return {
        currentPage,
        perPage,
        totalItems,
        totalPages,
        offset,
        hasNextPage,
        hasPreviousPage,
        isFirstPage,
        isLastPage,
        startItem,
        endItem,
        pageRange,
        goToPage,
        nextPage,
        previousPage,
        firstPage,
        lastPage,
        setPerPage,
        setTotal,
        reset,
        paginateArray
    };
}
