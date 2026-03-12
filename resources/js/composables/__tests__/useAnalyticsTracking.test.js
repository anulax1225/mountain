import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/owl-sdk.js', () => ({
    default: { analytics: { track: vi.fn().mockResolvedValue({}) } },
}));

vi.mock('vue', async () => {
    const actual = await vi.importActual('vue');
    return {
        ...actual,
        onMounted: vi.fn((cb) => cb()),
        onBeforeUnmount: vi.fn(),
    };
});

import owl from '@/owl-sdk.js';
import { useAnalyticsTracking } from '@/composables/useAnalyticsTracking';

describe('useAnalyticsTracking', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initTracking sets isTracking and calls trackProjectView', async () => {
        const { initTracking } = useAnalyticsTracking('test-project');

        initTracking();

        // Wait for the async trackEvent to be called
        await vi.waitFor(() => {
            expect(owl.analytics.track).toHaveBeenCalledWith(
                expect.objectContaining({
                    project_slug: 'test-project',
                    event_type: 'project_view',
                }),
            );
        });
    });

    it('trackImageView calls owl.analytics.track with image_slug', async () => {
        const { initTracking, trackImageView } = useAnalyticsTracking('test-project');

        initTracking();
        vi.clearAllMocks();

        trackImageView('image-123');

        await vi.waitFor(() => {
            expect(owl.analytics.track).toHaveBeenCalledWith(
                expect.objectContaining({
                    project_slug: 'test-project',
                    event_type: 'image_view',
                    image_slug: 'image-123',
                }),
            );
        });
    });

    it('trackHotspotClick calls owl.analytics.track with hotspot_slug', async () => {
        const { initTracking, trackHotspotClick } = useAnalyticsTracking('test-project');

        initTracking();
        vi.clearAllMocks();

        trackHotspotClick('hotspot-456');

        await vi.waitFor(() => {
            expect(owl.analytics.track).toHaveBeenCalledWith(
                expect.objectContaining({
                    project_slug: 'test-project',
                    event_type: 'hotspot_click',
                    hotspot_slug: 'hotspot-456',
                }),
            );
        });
    });

    it('trackSessionEnd includes duration_seconds', async () => {
        const { initTracking, trackSessionEnd } = useAnalyticsTracking('test-project');

        initTracking();
        vi.clearAllMocks();

        // Wait a tick so duration > 0
        trackSessionEnd();

        await vi.waitFor(() => {
            expect(owl.analytics.track).toHaveBeenCalledWith(
                expect.objectContaining({
                    project_slug: 'test-project',
                    event_type: 'session_end',
                    duration_seconds: expect.any(Number),
                }),
            );
        });
    });

    it('does not track if not initialized', () => {
        const { trackImageView } = useAnalyticsTracking('test-project');

        // Do NOT call initTracking
        trackImageView('image-999');

        expect(owl.analytics.track).not.toHaveBeenCalled();
    });
});
