<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * @group Analytics
 *
 * APIs for tracking and viewing project analytics
 */
class AnalyticsController extends Controller
{
    protected $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Track an analytics event
     *
     * Public endpoint for tracking visitor behavior on public projects.
     * No authentication required.
     *
     * @bodyParam project_slug string required The project slug. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam event_type string required Type of event: project_view, image_view, hotspot_click, session_end. Example: project_view
     * @bodyParam image_slug string The image slug (required for image_view events). Example: 660e8400-e29b-41d4-a716-446655440000
     * @bodyParam hotspot_slug string The hotspot slug (required for hotspot_click events). Example: 770e8400-e29b-41d4-a716-446655440000
     * @bodyParam duration_seconds integer Session duration in seconds (required for session_end events). Example: 120
     *
     * @response 200 {"success": true}
     * @response 404 {"error": "Project not found or not public"}
     */
    public function track(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_slug' => 'required|string',
            'event_type' => 'required|in:project_view,image_view,hotspot_click,session_end',
            'image_slug' => 'nullable|string',
            'hotspot_slug' => 'nullable|string',
            'duration_seconds' => 'nullable|integer|min:0',
        ]);

        // Find the project
        $project = Project::where('slug', $validated['project_slug'])->first();

        if (!$project || !$project->is_public) {
            return response()->json(['error' => 'Project not found or not public'], 404);
        }

        // Get request metadata
        $ip = $request->ip();
        $userAgent = $request->userAgent() ?? 'unknown';
        $sessionId = $this->analyticsService->generateSessionId($ip, $userAgent);
        $ipHash = $this->analyticsService->anonymizeIp($ip);

        // Resolve image_id and hotspot_id from slugs
        $imageId = null;
        $hotspotId = null;

        if (!empty($validated['image_slug'])) {
            $image = \App\Models\Image::where('slug', $validated['image_slug'])->first();
            $imageId = $image?->id;
        }

        if (!empty($validated['hotspot_slug'])) {
            $hotspot = \App\Models\Hotspot::where('slug', $validated['hotspot_slug'])->first();
            $hotspotId = $hotspot?->id;
        }

        // Track the event
        $this->analyticsService->trackEvent([
            'project_id' => $project->id,
            'session_id' => $sessionId,
            'event_type' => $validated['event_type'],
            'image_id' => $imageId,
            'hotspot_id' => $hotspotId,
            'duration_seconds' => $validated['duration_seconds'] ?? null,
            'referrer' => $request->header('Referer'),
            'user_agent' => $userAgent,
            'ip_hash' => $ipHash,
        ]);

        return response()->json(['success' => true]);
    }

    /**
     * Get project analytics
     *
     * Get analytics data for a project. Only accessible by project owner or admins.
     *
     * @authenticated
     * @urlParam slug string required The project slug. Example: 550e8400-e29b-41d4-a716-446655440000
     * @queryParam days integer Number of days to include in the analysis. Defaults to 30. Example: 7
     *
     * @response 200 {
     *   "overview": {
     *     "total_views": 150,
     *     "unique_sessions": 45,
     *     "total_hotspot_clicks": 320,
     *     "avg_session_duration": 180
     *   },
     *   "views_over_time": [
     *     {"date": "2024-01-01", "views": 12, "sessions": 8},
     *     {"date": "2024-01-02", "views": 15, "sessions": 10}
     *   ],
     *   "most_viewed_images": [
     *     {"image_id": 1, "image_slug": "abc123", "image_name": "Living Room", "views": 45},
     *     {"image_id": 2, "image_slug": "def456", "image_name": "Kitchen", "views": 38}
     *   ],
     *   "most_clicked_hotspots": [
     *     {"hotspot_id": 1, "hotspot_slug": "xyz789", "from_image_name": "Living Room", "to_image_name": "Kitchen", "clicks": 25},
     *     {"hotspot_id": 2, "hotspot_slug": "uvw012", "from_image_name": "Kitchen", "to_image_name": "Bedroom", "clicks": 18}
     *   ]
     * }
     * @response 403 {"error": "Analytics are only available for public projects"}
     */
    public function getProjectAnalytics(Request $request, string $slug): JsonResponse
    {
        $project = Project::where('slug', $slug)->firstOrFail();

        // Check authorization
        $this->authorize('view', $project);

        if (!$project->is_public) {
            return response()->json([
                'error' => 'Analytics are only available for public projects'
            ], 403);
        }

        $days = (int) ($request->query('days', 30));
        $days = min(max($days, 1), 365); // Limit between 1 and 365 days

        $overview = $this->analyticsService->getProjectOverview($project, $days);
        $viewsOverTime = $this->analyticsService->getViewsOverTime($project, $days);
        $mostViewedImages = $this->analyticsService->getMostViewedImages($project, 10);
        $mostClickedHotspots = $this->analyticsService->getMostClickedHotspots($project, 10);

        return response()->json([
            'overview' => $overview,
            'views_over_time' => $viewsOverTime,
            'most_viewed_images' => $mostViewedImages,
            'most_clicked_hotspots' => $mostClickedHotspots,
        ]);
    }
}
