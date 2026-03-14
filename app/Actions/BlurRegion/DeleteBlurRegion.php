<?php

namespace App\Actions\BlurRegion;

use App\Models\BlurRegion;

class DeleteBlurRegion
{
    public function __invoke(BlurRegion $blurRegion): void
    {
        $blurRegion->delete();
    }
}
