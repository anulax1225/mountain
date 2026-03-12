<?php

namespace App\Actions\Sticker;

use App\Models\Image;
use App\Models\Sticker;

class CreateSticker
{
    public function __invoke(Image $image, array $data): Sticker
    {
        return $image->stickers()->create($data);
    }
}
