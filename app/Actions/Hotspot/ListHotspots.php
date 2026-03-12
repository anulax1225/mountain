<?php

namespace App\Actions\Hotspot;

use App\Models\Scene;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListHotspots
{
    public function __invoke(Scene $scene): LengthAwarePaginator
    {
        return $scene->hotspots()->paginate(15);
    }
}
