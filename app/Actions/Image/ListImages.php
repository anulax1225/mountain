<?php

namespace App\Actions\Image;

use App\Models\Scene;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListImages
{
    public function __invoke(Scene $scene): LengthAwarePaginator
    {
        return $scene->images()
            ->with(['hotspotsFrom.toImage', 'hotspotsTo.fromImage'])
            ->paginate(15);
    }
}
