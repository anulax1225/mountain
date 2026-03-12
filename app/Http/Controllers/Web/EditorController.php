<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\SceneResource;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EditorController extends Controller
{
    public function show(Request $request, Project $project): Response
    {
        $this->authorize('update', $project);

        $project->load(['scenes.images.hotspotsFrom', 'scenes.images.hotspotsTo', 'scenes.images.stickers']);

        return Inertia::render('dashboard/Editor', [
            'project' => new ProjectResource($project),
            'scenes' => SceneResource::collection($project->scenes),
        ]);
    }
}
