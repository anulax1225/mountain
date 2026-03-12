<?php

namespace App\Actions\Project;

use App\Models\Project;

class DeleteProject
{
    public function __invoke(Project $project): void
    {
        $project->delete();
    }
}
