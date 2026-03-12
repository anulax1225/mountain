<?php

namespace App\Actions\Hotspot;

use App\Models\Hotspot;
use App\Models\Scene;

class CreateHotspot
{
    public function __invoke(Scene $scene, array $data): Hotspot
    {
        return $scene->hotspots()->create($data);
    }
}
