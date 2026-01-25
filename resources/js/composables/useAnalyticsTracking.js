import { ref, onMounted, onBeforeUnmount } from 'vue';
import owl from '@/owl-sdk.js';

/**
 * Composable for tracking analytics events on public projects
 * @param {string} projectSlug - The project slug
 * @returns {Object} - Tracking methods
 */
export function useAnalyticsTracking(projectSlug) {
    const sessionStartTime = ref(null);
    const isTracking = ref(false);

    /**
     * Track an analytics event
     */
    const trackEvent = async (eventType, data = {}) => {
        if (!projectSlug || !isTracking.value) return;

        try {
            await owl.analytics.track({
                project_slug: projectSlug,
                event_type: eventType,
                ...data,
            });
        } catch (error) {
            // Silently fail - don't disrupt user experience
            console.debug('Analytics tracking failed:', error);
        }
    };

    /**
     * Track project view (page load)
     */
    const trackProjectView = () => {
        trackEvent('project_view');
        sessionStartTime.value = Date.now();
    };

    /**
     * Track image view
     */
    const trackImageView = (imageSlug) => {
        trackEvent('image_view', { image_slug: imageSlug });
    };

    /**
     * Track hotspot click
     */
    const trackHotspotClick = (hotspotSlug) => {
        trackEvent('hotspot_click', { hotspot_slug: hotspotSlug });
    };

    /**
     * Track session end (page unload)
     */
    const trackSessionEnd = () => {
        if (!sessionStartTime.value) return;

        const durationSeconds = Math.floor((Date.now() - sessionStartTime.value) / 1000);

        trackEvent('session_end', { duration_seconds: durationSeconds });    
    };

    /**
     * Initialize tracking
     */
    const initTracking = () => {
        isTracking.value = true;
        trackProjectView();
    };

    // Setup lifecycle hooks
    onMounted(() => {
        // Track session end when user leaves
        window.addEventListener('beforeunload', trackSessionEnd);
        window.addEventListener('pagehide', trackSessionEnd);
    });

    onBeforeUnmount(() => {
        trackSessionEnd();
        window.removeEventListener('beforeunload', trackSessionEnd);
        window.removeEventListener('pagehide', trackSessionEnd);
    });

    return {
        initTracking,
        trackImageView,
        trackHotspotClick,
        trackProjectView,
        trackSessionEnd,
    };
}
