<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $this->authorize('viewAny', Role::class);

        $roles = Role::withCount('users')->get();

        return Inertia::render('Roles/Index', [
            'roles' => $roles,
        ]);
    }

    public function assignToUser(Request $request, User $user)
    {
        if (!$request->user()->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $user->roles()->syncWithoutDetaching([$validated['role_id']]);

        return back();
    }

    public function removeFromUser(Request $request, User $user)
    {
        if (!$request->user()->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $user->roles()->detach($validated['role_id']);

        return back();
    }
}