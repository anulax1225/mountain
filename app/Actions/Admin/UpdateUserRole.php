<?php

namespace App\Actions\Admin;

use App\Models\Role;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class UpdateUserRole
{
    public function __invoke(User $user, int $roleId): User
    {
        $role = Role::findOrFail($roleId);

        if (! $role->isGlobalRole()) {
            throw ValidationException::withMessages([
                'role_id' => ['Seuls les rôles globaux peuvent être assignés'],
            ]);
        }

        $globalRoleIds = Role::whereIn('slug', ['admin', 'client'])->pluck('id');
        $user->roles()->detach($globalRoleIds);
        $user->roles()->attach($roleId);

        return $user->fresh()->load('roles');
    }
}
