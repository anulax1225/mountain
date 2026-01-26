<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Scene;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboard/Index');
    }

    public function showProject($slug)
    {
        $project = Project::where('slug', $slug)->firstOrFail();
        $this->authorize('view', $project);

        return Inertia::render('dashboard/ProjectShow', [
            'projectSlug' => $slug,
        ]);
    }

    public function showScene($slug)
    {
        $scene = Scene::where('slug', $slug)->firstOrFail();
        $this->authorize('view', $scene->project);

        return Inertia::render('dashboard/SceneShow', [
            'sceneSlug' => $slug,
        ]);
    }

    public function showEditor($slug)
    {
        $project = Project::where('slug', $slug)->firstOrFail();
        $this->authorize('update', $project);

        return Inertia::render('dashboard/Editor', [
            'projectSlug' => $slug,
        ]);
    }

    public function settings()
    {
        return Inertia::render('dashboard/Settings');
    }

    public function adminUsers()
    {
        $this->authorize('viewAny', User::class);

        return Inertia::render('dashboard/AdminUsers');
    }

    public function showProjectAnalytics($slug)
    {
        $project = Project::where('slug', $slug)->firstOrFail();
        $this->authorize('view', $project);

        return Inertia::render('dashboard/ProjectAnalytics', [
            'projectSlug' => $slug,
        ]);
    }
}