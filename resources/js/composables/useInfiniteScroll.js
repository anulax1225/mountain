import { ref, computed, onMounted, onUnmounted } from 'vue';

export function useInfiniteScroll(options = {}) {
    const {
        loadMore = null,
        threshold = 200, // pixels from bottom to trigger load
        initialPage = 1,
        perPage = 10,
        container = null, // null means window, otherwise provide element ref
        enabled = true
    } = options;

    const isLoading = ref(false);
    const hasMore = ref(true);
    const currentPage = ref(initialPage);
    const items = ref([]);
    const error = ref(null);

    const canLoadMore = computed(() => {
        return enabled && hasMore.value && !isLoading.value;
    });

    const load = async () => {
        if (!canLoadMore.value || !loadMore) return;

        isLoading.value = true;
        error.value = null;

        try {
            const result = await loadMore(currentPage.value, perPage);

            if (result.data && result.data.length > 0) {
                items.value.push(...result.data);
                currentPage.value++;

                // Check if there are more items to load
                if (result.total !== undefined) {
                    hasMore.value = items.value.length < result.total;
                } else if (result.hasMore !== undefined) {
                    hasMore.value = result.hasMore;
                } else {
                    // Assume no more if we got fewer items than requested
                    hasMore.value = result.data.length >= perPage;
                }
            } else {
                hasMore.value = false;
            }

            return result;
        } catch (err) {
            error.value = err;
            console.error('Infinite scroll load error:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const checkScroll = () => {
        if (!canLoadMore.value) return;

        const element = container?.value || window;
        const scrollElement = container?.value || document.documentElement;

        let scrollTop, scrollHeight, clientHeight;

        if (container?.value) {
            scrollTop = container.value.scrollTop;
            scrollHeight = container.value.scrollHeight;
            clientHeight = container.value.clientHeight;
        } else {
            scrollTop = window.pageYOffset || scrollElement.scrollTop;
            scrollHeight = scrollElement.scrollHeight;
            clientHeight = window.innerHeight || scrollElement.clientHeight;
        }

        const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

        if (distanceFromBottom < threshold) {
            load();
        }
    };

    const reset = () => {
        items.value = [];
        currentPage.value = initialPage;
        hasMore.value = true;
        error.value = null;
    };

    const refresh = async () => {
        reset();
        return await load();
    };

    const append = (newItems) => {
        items.value.push(...newItems);
    };

    const prepend = (newItems) => {
        items.value.unshift(...newItems);
    };

    const remove = (predicate) => {
        items.value = items.value.filter(item => !predicate(item));
    };

    const update = (predicate, updates) => {
        const index = items.value.findIndex(predicate);
        if (index !== -1) {
            items.value[index] = { ...items.value[index], ...updates };
        }
    };

    let scrollElement = null;

    onMounted(() => {
        scrollElement = container?.value || window;
        
        if (scrollElement) {
            scrollElement.addEventListener('scroll', checkScroll, { passive: true });
            
            // Check immediately in case content doesn't fill the screen
            setTimeout(checkScroll, 100);
        }
    });

    onUnmounted(() => {
        if (scrollElement) {
            scrollElement.removeEventListener('scroll', checkScroll);
        }
    });

    return {
        items,
        isLoading,
        hasMore,
        currentPage,
        error,
        canLoadMore,
        load,
        reset,
        refresh,
        append,
        prepend,
        remove,
        update
    };
}

// Intersection Observer based infinite scroll (more efficient)
export function useInfiniteScrollObserver(options = {}) {
    const {
        loadMore = null,
        threshold = 0, // Intersection ratio
        rootMargin = '100px', // Load when sentinel is 100px away from viewport
        initialPage = 1,
        perPage = 10,
        enabled = true
    } = options;

    const isLoading = ref(false);
    const hasMore = ref(true);
    const currentPage = ref(initialPage);
    const items = ref([]);
    const error = ref(null);
    const sentinelElement = ref(null);

    let observer = null;

    const canLoadMore = computed(() => {
        return enabled && hasMore.value && !isLoading.value;
    });

    const load = async () => {
        if (!canLoadMore.value || !loadMore) return;

        isLoading.value = true;
        error.value = null;

        try {
            const result = await loadMore(currentPage.value, perPage);

            if (result.data && result.data.length > 0) {
                items.value.push(...result.data);
                currentPage.value++;

                if (result.total !== undefined) {
                    hasMore.value = items.value.length < result.total;
                } else if (result.hasMore !== undefined) {
                    hasMore.value = result.hasMore;
                } else {
                    hasMore.value = result.data.length >= perPage;
                }
            } else {
                hasMore.value = false;
            }

            return result;
        } catch (err) {
            error.value = err;
            console.error('Infinite scroll load error:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const setupObserver = () => {
        if (!sentinelElement.value) return;

        observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting && canLoadMore.value) {
                    load();
                }
            },
            {
                threshold,
                rootMargin
            }
        );

        observer.observe(sentinelElement.value);
    };

    const reset = () => {
        items.value = [];
        currentPage.value = initialPage;
        hasMore.value = true;
        error.value = null;
    };

    const refresh = async () => {
        reset();
        return await load();
    };

    onMounted(() => {
        setupObserver();
    });

    onUnmounted(() => {
        if (observer) {
            observer.disconnect();
        }
    });

    return {
        items,
        isLoading,
        hasMore,
        currentPage,
        error,
        canLoadMore,
        sentinelElement,
        load,
        reset,
        refresh
    };
}
