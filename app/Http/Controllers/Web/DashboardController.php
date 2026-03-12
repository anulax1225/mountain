<?php

namespace App\Http\Controllers\Web;

use App\Actions\Project\CreateProject;
use App\Actions\Project\DeleteProject;
use App\Actions\Project\ListProjects;
use App\Actions\Project\UpdateProject;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request, ListProjects $listProjects): Response
    {
        $projects = $listProjects($request->user());

        return Inertia::render('dashboard/Index', [
            'projects' => ProjectResource::collection($projects),
        ]);
    }

    public function settings(): Response
    {
        return Inertia::render('dashboard/Settings');
    }

    public function storeProject(StoreProjectRequest $request, CreateProject $createProject): RedirectResponse
    {
        $this->authorize('create', Project::class);

        $createProject(
            $request->validated(),
            $request->user(),
            $request->file('photo'),
        );

        return back();
    }

    public function updateProject(UpdateProjectRequest $request, Project $project, UpdateProject $updateProject): RedirectResponse
    {
        $this->authorize('update', $project);

        $updateProject(
            $project,
            $request->validated(),
            $request->file('photo'),
        );

        return back();
    }

    public function destroyProject(Project $project, DeleteProject $deleteProject): RedirectResponse
    {
        $this->authorize('delete', $project);

        $deleteProject($project);

        return redirect()->route('dashboard');
    }
}
