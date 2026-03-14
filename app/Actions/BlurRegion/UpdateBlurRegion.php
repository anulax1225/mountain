<?php

namespace App\Actions\BlurRegion;

use App\Models\BlurRegion;

class UpdateBlurRegion
{
    public function __invoke(BlurRegion $blurRegion, array $data): BlurRegion
    {
        $blurRegion->update($data);

        return $blurRegion;
    }
}
