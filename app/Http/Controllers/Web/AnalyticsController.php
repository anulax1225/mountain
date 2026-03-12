<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function show(Request $request, Project $project, AnalyticsService $analyticsService): Response
    {
        $this->authorize('view', $project);

        $days = (int) ($request->query('days', 30));
        $days = min(max($days, 1), 365);

        $analytics = null;
        if ($project->is_public) {
            $analytics = [
                'overview' => $analyticsService->getProjectOverview($project, $days),
                'views_over_time' => $analyticsService->getViewsOverTime($project, $days),
                'most_viewed_images' => $analyticsService->getMostViewedImages($project, 10),
                'most_clicked_hotspots' => $analyticsService->getMostClickedHotspots($project, 10),
            ];
        }

        return Inertia::render('dashboard/ProjectAnalytics', [
            'project' => new ProjectResource($project),
            'analytics' => $analytics,
            'selectedPeriod' => $days,
        ]);
    }
}
