<?php

namespace App\Actions\Project;

use App\Models\Project;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListProjects
{
    public function __invoke(User $user): LengthAwarePaginator
    {
        if ($user->isAdmin()) {
            return Project::with('scenes')->paginate(15);
        }

        $ownProjectIds = $user->projects()->pluck('id');
        $assignedProjectIds = $user->projectAccess()->pluck('projects.id');
        $allProjectIds = $ownProjectIds->merge($assignedProjectIds)->unique();

        return Project::whereIn('id', $allProjectIds)
            ->with('scenes')
            ->paginate(15);
    }
}
