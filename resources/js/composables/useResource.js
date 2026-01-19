import { ref, computed, watch } from 'vue';
import { useApiError } from './useApiError';
import api from '@/lib/api';

export function useResource(resourceType, slug, options = {}) {
    const {
        immediate = true,
        cache = true,
        cacheDuration = 5 * 60 * 1000, // 5 minutes
        transform = null,
        onSuccess = null,
        onError = null
    } = options;

    const { handleError, withRetry } = useApiError();

    const data = ref(null);
    const isLoading = ref(false);
    const error = ref(null);
    const lastFetchTime = ref(null);

    // Simple cache storage
    const cacheStore = new Map();

    const getCacheKey = () => `${resourceType}:${slug}`;

    const getFromCache = () => {
        if (!cache) return null;
        
        const key = getCacheKey();
        const cached = cacheStore.get(key);
        
        if (!cached) return null;
        
        const isExpired = Date.now() - cached.timestamp > cacheDuration;
        if (isExpired) {
            cacheStore.delete(key);
            return null;
        }
        
        return cached.data;
    };

    const setCache = (newData) => {
        if (!cache) return;
        
        const key = getCacheKey();
        cacheStore.set(key, {
            data: newData,
            timestamp: Date.now()
        });
    };

    const clearCache = () => {
        const key = getCacheKey();
        cacheStore.delete(key);
    };

    const fetchData = async (forceRefresh = false) => {
        if (!slug) {
            data.value = null;
            return;
        }

        // Check cache first
        if (!forceRefresh) {
            const cached = getFromCache();
            if (cached) {
                data.value = cached;
                return cached;
            }
        }

        isLoading.value = true;
        error.value = null;

        try {
            const fetchFn = async () => {
                let response;
                
                switch (resourceType) {
                    case 'project':
                        response = await api.projects.get(slug);
                        break;
                    case 'scene':
                        response = await api.scenes.get(slug);
                        break;
                    case 'image':
                        response = await api.images.get(slug);
                        break;
                    default:
                        throw new Error(`Unknown resource type: ${resourceType}`);
                }
                
                return response.data;
            };

            const result = await withRetry(fetchFn, {
                maxRetries: 3,
                delay: 1000,
                backoff: true
            });

            const transformedData = transform ? transform(result) : result;
            
            data.value = transformedData;
            lastFetchTime.value = Date.now();
            setCache(transformedData);

            if (onSuccess) {
                onSuccess(transformedData);
            }

            return transformedData;
        } catch (err) {
            error.value = err;
            
            handleError(err, {
                context: `Loading ${resourceType}`,
                showToast: true
            });

            if (onError) {
                onError(err);
            }

            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const refresh = () => fetchData(true);

    const update = (updates) => {
        if (data.value) {
            data.value = { ...data.value, ...updates };
            setCache(data.value);
        }
    };

    const remove = () => {
        data.value = null;
        clearCache();
    };

    // Auto-fetch on mount if immediate
    if (immediate && slug) {
        fetchData();
    }

    // Watch slug changes
    watch(() => slug, (newSlug) => {
        if (newSlug) {
            fetchData();
        } else {
            data.value = null;
            error.value = null;
        }
    });

    const isStale = computed(() => {
        if (!lastFetchTime.value) return true;
        return Date.now() - lastFetchTime.value > cacheDuration;
    });

    const isEmpty = computed(() => !data.value);
    const hasError = computed(() => !!error.value);

    return {
        data,
        isLoading,
        error,
        isEmpty,
        hasError,
        isStale,
        fetchData,
        refresh,
        update,
        remove,
        clearCache
    };
}

// Convenience functions for specific resource types
export function useProject(slug, options = {}) {
    return useResource('project', slug, options);
}

export function useScene(slug, options = {}) {
    return useResource('scene', slug, options);
}

export function useImage(slug, options = {}) {
    return useResource('image', slug, options);
}
