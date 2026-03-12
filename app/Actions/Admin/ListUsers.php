<?php

namespace App\Actions\Admin;

use App\Models\User;
use Illuminate\Support\Collection;

class ListUsers
{
    public function __invoke(): Collection
    {
        return User::with('roles')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->map(fn ($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'slug' => $role->slug,
                ]),
                'created_at' => $user->created_at,
                'invitation_pending' => $user->hasPendingInvitation(),
                'invitation_sent_at' => $user->invitation_sent_at,
            ];
        });
    }
}
