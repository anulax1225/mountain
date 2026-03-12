<?php

namespace App\Actions\Scene;

use App\Models\Project;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListScenes
{
    public function __invoke(Project $project): LengthAwarePaginator
    {
        return $project->scenes()->paginate(15);
    }
}
