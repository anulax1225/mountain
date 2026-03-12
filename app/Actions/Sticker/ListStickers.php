<?php

namespace App\Actions\Sticker;

use App\Models\Image;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListStickers
{
    public function __invoke(Image $image): LengthAwarePaginator
    {
        return $image->stickers()->paginate(50);
    }
}
