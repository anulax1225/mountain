<?php

namespace App\Actions\Scene;

use App\Models\Scene;

class DeleteScene
{
    public function __invoke(Scene $scene): void
    {
        $scene->delete();
    }
}
