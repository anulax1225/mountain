<?php

namespace App\Http\Controllers;

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
        return Inertia::render('dashboard/ProjectShow', [
            'projectSlug' => $slug,
        ]);
    }

    public function showScene($slug)
    {
        return Inertia::render('dashboard/SceneShow', [
            'sceneSlug' => $slug,
        ]);
    }

    public function showEditor($slug)
    {
        return Inertia::render('dashboard/Editor', [
            'sceneSlug' => $slug,
        ]);
    }

    public function settings()
    {
        return Inertia::render('dashboard/Settings');
    }

    public function adminUsers()
    {
        return Inertia::render('dashboard/AdminUsers');
    }
}