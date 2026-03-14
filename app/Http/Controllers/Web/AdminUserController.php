<?php

namespace App\Http\Controllers\Web;

use App\Actions\Admin\CreateUser;
use App\Actions\Admin\DeleteUser;
use App\Actions\Admin\ListUsers;
use App\Actions\Admin\ResendInvitation;
use App\Actions\Admin\UpdateUserRole;
use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    public function index(ListUsers $listUsers): Response
    {
        $this->authorize('viewAny', User::class);

        $roles = Role::whereIn('slug', ['admin', 'client'])->get();

        return Inertia::render('dashboard/AdminUsers', [
            'users' => $listUsers(),
            'roles' => $roles,
        ]);
    }

    public function store(Request $request, CreateUser $createUser): RedirectResponse
    {
        $this->authorize('create', User::class);

        $validated = $request->validate([
            'email' => 'required|email|unique:users,email',
            'role_id' => 'nullable|exists:roles,id',
            'name' => 'nullable|string|max:255',
        ]);

        $createUser($validated);

        return back();
    }

    public function updateRole(Request $request, User $user, UpdateUserRole $updateUserRole): RedirectResponse
    {
        $this->authorize('manageRoles', User::class);

        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $updateUserRole($user, $validated['role_id']);

        return back();
    }

    public function resendInvitation(User $user, ResendInvitation $resendInvitation): RedirectResponse
    {
        $this->authorize('update', $user);

        $resendInvitation($user);

        return back();
    }

    public function destroy(User $user, DeleteUser $deleteUser): RedirectResponse
    {
        $this->authorize('delete', $user);

        $deleteUser($user);

        return back();
    }
}
