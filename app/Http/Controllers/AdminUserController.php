<?php

namespace App\Http\Controllers;

use App\Actions\Admin\CreateUser;
use App\Actions\Admin\DeleteUser;
use App\Actions\Admin\ListUsers;
use App\Actions\Admin\ResendInvitation;
use App\Actions\Admin\UpdateUserRole;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * @group Admin - User Management
 *
 * APIs for admin user management
 */
class AdminUserController extends Controller
{
    /**
     * List all users with their roles
     */
    public function index(ListUsers $listUsers): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        return response()->json([
            'data' => $listUsers(),
        ]);
    }

    /**
     * Get all available global roles
     */
    public function roles(): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $roles = Role::whereIn('slug', ['admin', 'client'])->get();

        return response()->json([
            'data' => $roles,
        ]);
    }

    /**
     * Create a new user with a role and send invitation email
     */
    public function store(Request $request, CreateUser $createUser): JsonResponse
    {
        $this->authorize('create', User::class);

        $validated = $request->validate([
            'email' => 'required|email|unique:users,email',
            'role_id' => 'nullable|exists:roles,id',
            'name' => 'nullable|string|max:255',
        ]);

        $result = $createUser($validated);
        $user = $result['user'];

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->map(fn ($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'slug' => $role->slug,
                ]),
                'created_at' => $user->created_at,
                'invitation_pending' => true,
            ],
            'message' => $result['message'],
        ], 201);
    }

    /**
     * Resend invitation email
     */
    public function resendInvitation(User $user, ResendInvitation $resendInvitation): JsonResponse
    {
        $this->authorize('update', $user);

        $resendInvitation($user);

        return response()->json([
            'message' => 'Invitation renvoyée avec succès',
        ]);
    }

    /**
     * Update user's role
     */
    public function updateRole(Request $request, User $user, UpdateUserRole $updateUserRole): JsonResponse
    {
        $this->authorize('manageRoles', User::class);

        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $user = $updateUserRole($user, $validated['role_id']);

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->map(fn ($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'slug' => $role->slug,
                ]),
            ],
            'message' => 'Rôle mis à jour avec succès',
        ]);
    }

    /**
     * Delete a user
     */
    public function destroy(User $user, DeleteUser $deleteUser): Response
    {
        $this->authorize('delete', $user);

        $deleteUser($user);

        return response()->noContent();
    }
}
