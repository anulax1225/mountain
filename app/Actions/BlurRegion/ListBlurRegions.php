<?php

namespace App\Actions\BlurRegion;

use App\Models\Image;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListBlurRegions
{
    public function __invoke(Image $image): LengthAwarePaginator
    {
        return $image->blurRegions()->paginate(50);
    }
}
