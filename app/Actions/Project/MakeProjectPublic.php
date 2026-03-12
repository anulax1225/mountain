<?php

namespace App\Actions\Project;

use App\Models\Image;
use App\Models\Project;

class MakeProjectPublic
{
    public function __invoke(Project $project, array $data): Project
    {
        $image = Image::where('slug', $data['start_image_id'])->first();

        if ($data['is_public'] && $image) {
            $project->update([
                'is_public' => true,
                'start_image_id' => $image->id,
            ]);
        } elseif ($data['is_public']) {
            $project->update([
                'is_public' => true,
            ]);
        } else {
            $project->update([
                'is_public' => false,
                'start_image_id' => null,
            ]);
        }

        return $project;
    }
}
