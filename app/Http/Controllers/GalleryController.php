<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Inertia\Inertia;

class GalleryController extends Controller
{
    public function index()
    {
        $projects = Project::with(['user', 'startImage'])
            ->where('is_public', true)
            ->latest()
            ->paginate(12);

        return Inertia::render('gallery/Index', [
            'projects' => $projects,
        ]);
    }

    public function show(Project $project)
    {
        if (!$project->is_public) {
            abort(404);
        }

        $project->load([
            'scenes.images.hotspots',
            'startImage',
        ]);

        return Inertia::render('gallery/Show', [
            'project' => $project,
        ]);
    }
}