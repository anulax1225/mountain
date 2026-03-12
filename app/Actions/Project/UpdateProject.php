<?php

namespace App\Actions\Project;

use App\Models\Project;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class UpdateProject
{
    public function __invoke(Project $project, array $data, ?UploadedFile $photo = null): Project
    {
        if ($photo) {
            if ($project->picture_path && Storage::disk('s3')->exists($project->picture_path)) {
                Storage::disk('s3')->delete($project->picture_path);
            }

            $data['picture_path'] = $photo->store('project-photos', 's3');
            unset($data['photo']);
        }

        $project->update($data);

        return $project;
    }
}
