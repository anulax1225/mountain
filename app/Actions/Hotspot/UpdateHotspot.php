<?php

namespace App\Actions\Hotspot;

use App\Models\Hotspot;

class UpdateHotspot
{
    public function __invoke(Hotspot $hotspot, array $data): Hotspot
    {
        $hotspot->update($data);

        return $hotspot;
    }
}
