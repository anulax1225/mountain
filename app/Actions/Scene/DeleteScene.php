<?php

namespace App\Actions\Scene;

use App\Models\Scene;

class DeleteScene
{
    public function __invoke(Scene $scene): void
    {
        $project = $scene->project;
        $sceneImageIds = $scene->images()->pluck('id')->all();
        $wasStartImageInScene = in_array($project->start_image_id, $sceneImageIds, true);

        $scene->delete();

        if ($wasStartImageInScene) {
            $project->update([
                'is_public' => false,
                'start_image_id' => null,
            ]);
        }
    }
}
