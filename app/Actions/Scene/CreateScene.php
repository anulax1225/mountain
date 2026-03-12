<?php

namespace App\Actions\Scene;

use App\Models\Project;
use App\Models\Scene;

class CreateScene
{
    public function __invoke(Project $project, array $data): Scene
    {
        return $project->scenes()->create($data);
    }
}
