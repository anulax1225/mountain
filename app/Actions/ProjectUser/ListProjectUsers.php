<?php

namespace App\Actions\ProjectUser;

use App\Models\Project;
use Illuminate\Support\Collection;

class ListProjectUsers
{
    public function __invoke(Project $project): Collection
    {
        return $project->assignedUsers()
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
    }
}
