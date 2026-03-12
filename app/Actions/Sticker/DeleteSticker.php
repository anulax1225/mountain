<?php

namespace App\Actions\Sticker;

use App\Models\Sticker;

class DeleteSticker
{
    public function __invoke(Sticker $sticker): void
    {
        $sticker->delete();
    }
}
