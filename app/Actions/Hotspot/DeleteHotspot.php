<?php

namespace App\Actions\Hotspot;

use App\Models\Hotspot;

class DeleteHotspot
{
    public function __invoke(Hotspot $hotspot): void
    {
        $hotspot->delete();
    }
}
