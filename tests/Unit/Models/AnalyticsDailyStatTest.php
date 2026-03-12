<?php

use App\Models\AnalyticsDailyStat;
use App\Models\Project;

it('belongs to a project', function () {
    $stat = AnalyticsDailyStat::factory()->create();

    expect($stat->project)->toBeInstanceOf(Project::class);
});

it('has correct fillable attributes', function () {
    $stat = new AnalyticsDailyStat;

    expect($stat->getFillable())->toBe([
        'project_id', 'date', 'total_views', 'unique_visitors',
        'avg_duration_seconds', 'total_image_views', 'total_hotspot_clicks',
    ]);
});

it('casts date to date instance', function () {
    $stat = AnalyticsDailyStat::factory()->create();

    expect($stat->date)->toBeInstanceOf(\Illuminate\Support\Carbon::class);
});

it('casts timestamps', function () {
    $stat = AnalyticsDailyStat::factory()->create();

    expect($stat->created_at)->toBeInstanceOf(\Illuminate\Support\Carbon::class)
        ->and($stat->updated_at)->toBeInstanceOf(\Illuminate\Support\Carbon::class);
});
