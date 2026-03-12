<?php

namespace App\Actions\Sticker;

use App\Models\Sticker;

class UpdateSticker
{
    public function __invoke(Sticker $sticker, array $data): Sticker
    {
        $sticker->update($data);

        return $sticker;
    }
}
