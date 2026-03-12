<?php

namespace App\Actions\Scene;

use App\Models\Scene;

class UpdateScene
{
    public function __invoke(Scene $scene, array $data): Scene
    {
        $scene->update($data);

        return $scene;
    }
}
