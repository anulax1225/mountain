<?php

namespace App\Actions\ProjectUser;

use App\Models\Project;
use App\Models\User;

class RemoveProjectUser
{
    public function __invoke(Project $project, User $user): void
    {
        $project->assignedUsers()->detach($user->id);
    }
}
