<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Example: Fetch projects from API or database
        $projects = [
            [
                'id' => 1,
                'slug' => 'museum-virtual-tour',
                'name' => 'Museum Virtual Tour',
                'scenes_count' => 8,
                'updated_at' => '2 hours ago',
            ],
            [
                'id' => 2,
                'slug' => 'real-estate-showcase',
                'name' => 'Real Estate Showcase',
                'scenes_count' => 12,
                'updated_at' => '1 day ago',
            ],
            [
                'id' => 3,
                'slug' => 'hotel-preview',
                'name' => 'Hotel Preview',
                'scenes_count' => 6,
                'updated_at' => '3 days ago',
            ],
        ];

        return Inertia::render('dashboard/Index', [
            'projects' => $projects,
        ]);
    }

    public function settings()
    {
        return Inertia::render('dashboard/Settings');
    }
}
