<?php

namespace App\Actions\Image;

use App\Models\Image;
use Illuminate\Support\Facades\Storage;

class DeleteImage
{
    public function __invoke(Image $image): void
    {
        Storage::disk('s3')->delete($image->path);
        $image->delete();
    }
}
