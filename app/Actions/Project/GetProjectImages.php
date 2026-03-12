<?php

namespace App\Actions\Project;

use App\Models\Project;
use Illuminate\Support\Collection;

class GetProjectImages
{
    public function __invoke(Project $project): Collection
    {
        return $project->scenes()->with('images')->get()
            ->flatMap(function ($scene) {
                return $scene->images->map(function ($image) use ($scene) {
                    $imageArray = $image->toArray();
                    $imageArray['scene'] = [
                        'slug' => $scene->slug,
                        'name' => $scene->name,
                    ];

                    return $imageArray;
                });
            });
    }
}
