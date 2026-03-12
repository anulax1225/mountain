<?php

namespace App\Http\Controllers;

use App\Actions\ProjectUser\AssignProjectUser;
use App\Actions\ProjectUser\ListProjectUsers;
use App\Actions\ProjectUser\RemoveProjectUser;
use App\Http\Requests\AssignProjectUserRequest;
use App\Models\Project;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

/**
 * @group Project Users
 *
 * APIs for managing project user assignments
 */
class ProjectUserController extends Controller
{
    /**
     * List users assigned to a project
     */
    public function index(Project $project, ListProjectUsers $listProjectUsers): JsonResponse
    {
        $this->authorize('view', $project);

        return response()->json($listProjectUsers($project));
    }

    /**
     * Assign a user to a project with a role
     */
    public function store(AssignProjectUserRequest $request, Project $project, AssignProjectUser $assignProjectUser): JsonResponse
    {
        $this->authorize('assignUsers', $project);

        $data = $request->validated();
        $result = $assignProjectUser($project, $data['user_id'], $data['role_id']);

        return response()->json(
            ['message' => $result['message']],
            $result['created'] ? 201 : 200,
        );
    }

    /**
     * Remove a user from a project
     */
    public function destroy(Project $project, User $user, RemoveProjectUser $removeProjectUser): Response
    {
        $this->authorize('assignUsers', $project);

        $removeProjectUser($project, $user);

        return response()->noContent();
    }

    /**
     * Get non-admin users (for assignment dropdown)
     */
    public function availableUsers(): JsonResponse
    {
        $adminRoleId = Role::where('slug', 'admin')->value('id');

        $users = User::select('users.id', 'users.name', 'users.email')
            ->whereDoesntHave('roles', function ($query) use ($adminRoleId) {
                $query->where('roles.id', $adminRoleId);
            })
            ->get();

        return response()->json($users);
    }

    /**
     * Get project-level roles (for assignment dropdown)
     */
    public function availableRoles(): JsonResponse
    {
        $roles = Role::select('id', 'name', 'description')
            ->whereIn('slug', ['owner', 'viewer'])
            ->get();

        return response()->json($roles);
    }
}
