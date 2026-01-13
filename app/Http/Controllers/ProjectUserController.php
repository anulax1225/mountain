<?php

namespace App\Http\Controllers;

use App\Http\Requests\AssignProjectUserRequest;
use App\Models\Project;
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
    public function index(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $users = $project->assignedUsers()
            ->with('roles')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role_id' => $user->pivot->role_id,
                    'assigned_at' => $user->pivot->created_at,
                ];
            });

        return response()->json($users);
    }

    /**
     * Assign a user to a project with a role
     */
    public function store(AssignProjectUserRequest $request, Project $project): JsonResponse
    {
        $this->authorize('assignUsers', $project);

        $data = $request->validated();

        $existingAssignment = $project->assignedUsers()
            ->where('user_id', $data['user_id'])
            ->first();

        if ($existingAssignment) {
            $project->assignedUsers()->updateExistingPivot($data['user_id'], [
                'role_id' => $data['role_id'],
            ]);

            return response()->json([
                'message' => 'User role updated successfully',
            ]);
        }

        $project->assignedUsers()->attach($data['user_id'], [
            'role_id' => $data['role_id'],
        ]);

        return response()->json([
            'message' => 'User assigned to project successfully',
        ], 201);
    }

    /**
     * Remove a user from a project
     */
    public function destroy(Project $project, User $user): Response
    {
        $this->authorize('assignUsers', $project);

        $project->assignedUsers()->detach($user->id);

        return response()->noContent();
    }

    /**
     * Get all users (for assignment dropdown)
     */
    public function availableUsers(): JsonResponse
    {
        $users = User::select('id', 'name', 'email')->get();

        return response()->json($users);
    }

    /**
     * Get all roles (for assignment dropdown)
     */
    public function availableRoles(): JsonResponse
    {
        $roles = \App\Models\Role::select('id', 'name', 'description')->get();

        return response()->json($roles);
    }
}
