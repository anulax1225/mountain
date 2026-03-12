<?php

namespace App\Http\Controllers\Web;

use App\Actions\Project\GetProjectImages;
use App\Actions\Project\MakeProjectPublic;
use App\Actions\Project\UpdateProject;
use App\Actions\ProjectUser\AssignProjectUser;
use App\Actions\ProjectUser\ListProjectUsers;
use App\Actions\ProjectUser\RemoveProjectUser;
use App\Actions\Scene\CreateScene;
use App\Actions\Scene\DeleteScene;
use App\Actions\Scene\UpdateScene;
use App\Http\Controllers\Controller;
use App\Http\Requests\AssignProjectUserRequest;
use App\Http\Requests\MakeProjectPublicRequest;
use App\Http\Requests\StoreSceneRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Requests\UpdateSceneRequest;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\SceneResource;
use App\Models\Project;
use App\Models\Role;
use App\Models\Scene;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function show(Request $request, Project $project, GetProjectImages $getProjectImages, ListProjectUsers $listProjectUsers): Response
    {
        $this->authorize('view', $project);

        $project->load(['scenes.images', 'startImage']);

        $adminRoleId = Role::where('slug', 'admin')->value('id');
        $availableUsers = User::select('users.id', 'users.name', 'users.email')
            ->whereDoesntHave('roles', function ($query) use ($adminRoleId) {
                $query->where('roles.id', $adminRoleId);
            })
            ->get();

        $availableRoles = Role::select('id', 'name', 'description')
            ->whereIn('slug', ['owner', 'viewer'])
            ->get();

        return Inertia::render('dashboard/ProjectShow', [
            'project' => new ProjectResource($project),
            'scenes' => SceneResource::collection($project->scenes),
            'projectImages' => fn () => $getProjectImages($project),
            'assignedUsers' => fn () => $listProjectUsers($project),
            'availableUsers' => $availableUsers,
            'availableRoles' => $availableRoles,
        ]);
    }

    public function storeScene(StoreSceneRequest $request, Project $project, CreateScene $createScene): RedirectResponse
    {
        $this->authorize('update', $project);

        $createScene($project, $request->validated());

        return back();
    }

    public function updateScene(UpdateSceneRequest $request, Scene $scene, UpdateScene $updateScene): RedirectResponse
    {
        $this->authorize('update', $scene->project);

        $updateScene($scene, $request->validated());

        return back();
    }

    public function destroyScene(Scene $scene, DeleteScene $deleteScene): RedirectResponse
    {
        $this->authorize('update', $scene->project);
        $this->authorize('delete', $scene);

        $deleteScene($scene);

        return back();
    }

    public function makePublic(MakeProjectPublicRequest $request, Project $project, MakeProjectPublic $makeProjectPublic): RedirectResponse
    {
        $this->authorize('makePublic', $project);

        $makeProjectPublic($project, $request->validated());

        return back();
    }

    public function update(UpdateProjectRequest $request, Project $project, UpdateProject $updateProject): RedirectResponse
    {
        $this->authorize('update', $project);

        $updateProject(
            $project,
            $request->validated(),
            $request->file('photo'),
        );

        return back();
    }

    public function assignUser(AssignProjectUserRequest $request, Project $project, AssignProjectUser $assignProjectUser): RedirectResponse
    {
        $this->authorize('assignUsers', $project);

        $data = $request->validated();
        $assignProjectUser($project, $data['user_id'], $data['role_id']);

        return back();
    }

    public function removeUser(Project $project, User $user, RemoveProjectUser $removeProjectUser): RedirectResponse
    {
        $this->authorize('assignUsers', $project);

        $removeProjectUser($project, $user);

        return back();
    }
}
