<?php

namespace App\Http\Controllers;

use App\Mail\UserInvitation;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

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
    public function index()
    {
        $this->authorize('viewAny', User::class);

        $users = User::with('roles')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->map(fn($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'slug' => $role->slug,
                ]),
                'created_at' => $user->created_at,
                'invitation_pending' => $user->hasPendingInvitation(),
                'invitation_sent_at' => $user->invitation_sent_at,
            ];
        });

        return response()->json([
            'data' => $users,
        ]);
    }

    /**
     * Get all available global roles
     */
    public function roles()
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
    public function store(Request $request)
    {
        $this->authorize('create', User::class);

        $validated = $request->validate([
            'email' => 'required|email|unique:users,email',
            'role_id' => 'required|exists:roles,id',
            'name' => 'nullable|string|max:255',
        ]);

        // Generate invitation token
        $invitationToken = Str::random(64);

        // Create user with temporary password (will be set by user during registration)
        $user = User::create([
            'name' => $validated['name'] ?? explode('@', $validated['email'])[0],
            'email' => $validated['email'],
            'password' => Hash::make(Str::random(32)), // Temporary unusable password
            'invitation_token' => $invitationToken,
            'invitation_sent_at' => now(),
        ]);

        // Assign the role
        $user->roles()->attach($validated['role_id']);

        // Send invitation email
        $invitationUrl = url('/register/invitation/' . $invitationToken);
        Mail::to($user->email)->send(new UserInvitation($user, $invitationUrl));

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->map(fn($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'slug' => $role->slug,
                ]),
                'created_at' => $user->created_at,
                'invitation_pending' => true,
            ],
            'message' => 'Utilisateur créé et invitation envoyée',
        ], 201);
    }

    /**
     * Resend invitation email
     */
    public function resendInvitation(User $user)
    {
        $this->authorize('update', $user);

        if (!$user->hasPendingInvitation()) {
            return response()->json([
                'message' => 'Cet utilisateur a déjà complété son inscription',
            ], 422);
        }

        // Generate new token
        $invitationToken = Str::random(64);
        $user->update([
            'invitation_token' => $invitationToken,
            'invitation_sent_at' => now(),
        ]);

        // Send invitation email
        $invitationUrl = url('/register/invitation/' . $invitationToken);
        Mail::to($user->email)->send(new UserInvitation($user, $invitationUrl));

        return response()->json([
            'message' => 'Invitation renvoyée avec succès',
        ]);
    }

    /**
     * Update user's role
     */
    public function updateRole(Request $request, User $user)
    {
        $this->authorize('manageRoles', User::class);

        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        // Only allow global roles (admin, client)
        $role = Role::find($validated['role_id']);
        if (!$role->isGlobalRole()) {
            return response()->json([
                'message' => 'Seuls les rôles globaux peuvent être assignés',
            ], 422);
        }

        // Remove existing global roles and assign new one
        $globalRoleIds = Role::whereIn('slug', ['admin', 'client'])->pluck('id');
        $user->roles()->detach($globalRoleIds);
        $user->roles()->attach($validated['role_id']);

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->fresh()->roles->map(fn($role) => [
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
    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        $user->delete();

        return response()->noContent();
    }
}
