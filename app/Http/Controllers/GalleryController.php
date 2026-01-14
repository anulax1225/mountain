<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProjectResource;
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
            'scenes.images.hotspotsFrom',
            'scenes.images.hotspotsTo',
            'scenes.hotspots',
            'startImage.hotspotsFrom',
        ]);
        //dd((new ProjectResource($project))->toArray(request()));
        return Inertia::render('gallery/Show', [
            'project' => (new ProjectResource($project))->toArray(request()),
        ]);
    }
}