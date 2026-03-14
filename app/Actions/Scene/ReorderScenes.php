<?php

namespace App\Actions\Scene;

use App\Models\Project;
use App\Models\Scene;
use Illuminate\Support\Facades\DB;

class ReorderScenes
{
    /**
     * Reorder scenes within a project.
     *
     * @param  array<int, string>  $slugs  Ordered array of scene slugs
     */
    public function __invoke(Project $project, array $slugs): void
    {
        DB::transaction(function () use ($project, $slugs) {
            foreach ($slugs as $position => $slug) {
                Scene::where('slug', $slug)
                    ->where('project_id', $project->id)
                    ->update(['position' => $position]);
            }
        });
    }
}
