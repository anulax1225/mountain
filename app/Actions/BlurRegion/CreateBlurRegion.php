<?php

namespace App\Actions\BlurRegion;

use App\Models\BlurRegion;
use App\Models\Image;

class CreateBlurRegion
{
    public function __invoke(Image $image, array $data): BlurRegion
    {
        return $image->blurRegions()->create($data);
    }
}
