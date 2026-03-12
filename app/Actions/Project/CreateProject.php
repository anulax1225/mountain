<?php

namespace App\Actions\Project;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\UploadedFile;

class CreateProject
{
    public function __invoke(array $data, User $user, ?UploadedFile $photo = null): Project
    {
        $data['user_id'] = $user->id;

        if ($photo) {
            $data['picture_path'] = $photo->store('project-photos', 's3');
            unset($data['photo']);
        }

        return Project::create($data);
    }
}
