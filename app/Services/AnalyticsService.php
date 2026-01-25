<?php

namespace App\Services;

use App\Models\AnalyticsEvent;
use App\Models\AnalyticsDailyStat;
use App\Models\Project;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    /**
     * Generate an anonymized session ID from IP and user agent
     */
    public function generateSessionId(string $ip, string $userAgent): string
    {
        return hash('sha256', $ip . $userAgent . date('Y-m-d'));
    }

    /**
     * Anonymize an IP address using SHA-256
     */
    public function anonymizeIp(string $ip): string
    {
        return hash('sha256', $ip . config('app.key'));
    }

    /**
     * Track an analytics event
     */
    public function trackEvent(array $data): AnalyticsEvent
    {
        return AnalyticsEvent::create([
            'project_id' => $data['project_id'],
            'session_id' => $data['session_id'],
            'event_type' => $data['event_type'],
            'image_id' => $data['image_id'] ?? null,
            'hotspot_id' => $data['hotspot_id'] ?? null,
            'duration_seconds' => $data['duration_seconds'] ?? null,
            'referrer' => $data['referrer'] ?? null,
            'user_agent' => $data['user_agent'] ?? null,
            'ip_hash' => $data['ip_hash'] ?? null,
        ]);
    }

    /**
     * Get analytics overview for a project
     */
    public function getProjectOverview(Project $project, int $days = 30): array
    {
        $startDate = Carbon::now()->subDays($days)->startOfDay();

        // Get total views (project_view events)
        $totalViews = AnalyticsEvent::where('project_id', $project->id)
            ->where('event_type', AnalyticsEvent::TYPE_PROJECT_VIEW)
            ->where('created_at', '>=', $startDate)
            ->count();

        // Get unique visitors (distinct session_ids)
        $uniqueVisitors = AnalyticsEvent::where('project_id', $project->id)
            ->where('event_type', AnalyticsEvent::TYPE_PROJECT_VIEW)
            ->where('created_at', '>=', $startDate)
            ->distinct('session_id')
            ->count('session_id');

        // Get average session duration
        $avgDuration = AnalyticsEvent::where('project_id', $project->id)
            ->where('event_type', AnalyticsEvent::TYPE_SESSION_END)
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('duration_seconds')
            ->avg('duration_seconds') ?? 0;

        // Get total image views
        $totalImageViews = AnalyticsEvent::where('project_id', $project->id)
            ->where('event_type', AnalyticsEvent::TYPE_IMAGE_VIEW)
            ->where('created_at', '>=', $startDate)
            ->count();

        // Get total hotspot clicks
        $totalHotspotClicks = AnalyticsEvent::where('project_id', $project->id)
            ->where('event_type', AnalyticsEvent::TYPE_HOTSPOT_CLICK)
            ->where('created_at', '>=', $startDate)
            ->count();

        return [
            'total_views' => $totalViews,
            'unique_visitors' => $uniqueVisitors,
            'avg_duration_seconds' => round($avgDuration),
            'total_image_views' => $totalImageViews,
            'total_hotspot_clicks' => $totalHotspotClicks,
            'period_days' => $days,
        ];
    }

    /**
     * Get views over time (daily breakdown)
     */
    public function getViewsOverTime(Project $project, int $days = 30): array
    {
        $startDate = Carbon::now()->subDays($days)->startOfDay();

        $dailyViews = AnalyticsEvent::where('project_id', $project->id)
            ->where('event_type', AnalyticsEvent::TYPE_PROJECT_VIEW)
            ->where('created_at', '>=', $startDate)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as views'),
                DB::raw('COUNT(DISTINCT session_id) as unique_visitors')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // Fill in missing dates with zeros
        $result = [];
        for ($i = 0; $i < $days; $i++) {
            $date = Carbon::now()->subDays($days - $i - 1)->format('Y-m-d');
            $dayData = $dailyViews->firstWhere('date', $date);

            $result[] = [
                'date' => $date,
                'views' => $dayData ? $dayData->views : 0,
                'unique_visitors' => $dayData ? $dayData->unique_visitors : 0,
            ];
        }

        return $result;
    }

    /**
     * Get most viewed images
     */
    public function getMostViewedImages(Project $project, int $limit = 10): array
    {
        return AnalyticsEvent::where('project_id', $project->id)
            ->where('event_type', AnalyticsEvent::TYPE_IMAGE_VIEW)
            ->whereNotNull('image_id')
            ->select('image_id', DB::raw('COUNT(*) as view_count'))
            ->with('image:id,slug,name,path')
            ->groupBy('image_id')
            ->orderBy('view_count', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($event) {
                return [
                    'image' => $event->image,
                    'view_count' => $event->view_count,
                ];
            })
            ->toArray();
    }

    /**
     * Get most clicked hotspots
     */
    public function getMostClickedHotspots(Project $project, int $limit = 10): array
    {
        return AnalyticsEvent::where('project_id', $project->id)
            ->where('event_type', AnalyticsEvent::TYPE_HOTSPOT_CLICK)
            ->whereNotNull('hotspot_id')
            ->select('hotspot_id', DB::raw('COUNT(*) as click_count'))
            ->with('hotspot')
            ->groupBy('hotspot_id')
            ->orderBy('click_count', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($event) {
                return [
                    'hotspot' => $event->hotspot,
                    'click_count' => $event->click_count,
                ];
            })
            ->toArray();
    }

    /**
     * Aggregate analytics into daily stats (for performance)
     * Should be run daily via cron
     */
    public function aggregateDailyStats(Carbon $date = null): void
    {
        $date = $date ?? Carbon::yesterday();
        $dateString = $date->format('Y-m-d');

        // Get all projects that have events on this date
        $projectIds = AnalyticsEvent::whereDate('created_at', $dateString)
            ->distinct('project_id')
            ->pluck('project_id');

        foreach ($projectIds as $projectId) {
            $totalViews = AnalyticsEvent::where('project_id', $projectId)
                ->where('event_type', AnalyticsEvent::TYPE_PROJECT_VIEW)
                ->whereDate('created_at', $dateString)
                ->count();

            $uniqueVisitors = AnalyticsEvent::where('project_id', $projectId)
                ->where('event_type', AnalyticsEvent::TYPE_PROJECT_VIEW)
                ->whereDate('created_at', $dateString)
                ->distinct('session_id')
                ->count('session_id');

            $avgDuration = AnalyticsEvent::where('project_id', $projectId)
                ->where('event_type', AnalyticsEvent::TYPE_SESSION_END)
                ->whereDate('created_at', $dateString)
                ->whereNotNull('duration_seconds')
                ->avg('duration_seconds') ?? 0;

            $totalImageViews = AnalyticsEvent::where('project_id', $projectId)
                ->where('event_type', AnalyticsEvent::TYPE_IMAGE_VIEW)
                ->whereDate('created_at', $dateString)
                ->count();

            $totalHotspotClicks = AnalyticsEvent::where('project_id', $projectId)
                ->where('event_type', AnalyticsEvent::TYPE_HOTSPOT_CLICK)
                ->whereDate('created_at', $dateString)
                ->count();

            AnalyticsDailyStat::updateOrCreate(
                [
                    'project_id' => $projectId,
                    'date' => $dateString,
                ],
                [
                    'total_views' => $totalViews,
                    'unique_visitors' => $uniqueVisitors,
                    'avg_duration_seconds' => round($avgDuration),
                    'total_image_views' => $totalImageViews,
                    'total_hotspot_clicks' => $totalHotspotClicks,
                ]
            );
        }
    }

    /**
     * Delete old raw events (keep aggregated stats)
     * Should be run weekly via cron
     */
    public function deleteOldEvents(int $daysToKeep = 90): int
    {
        $cutoffDate = Carbon::now()->subDays($daysToKeep);

        return AnalyticsEvent::where('created_at', '<', $cutoffDate)->delete();
    }
}
