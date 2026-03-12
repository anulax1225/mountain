<?php

namespace App\Actions\Image;

use App\Jobs\GenerateImagePreview;
use App\Models\Image;
use App\Models\Scene;
use Illuminate\Support\Facades\Storage;

class StoreImage
{
    public function __invoke(Scene $scene, string $stagingKey, ?string $name, int $size): Image
    {
        $disk = Storage::disk('s3');

        $filename = basename($stagingKey);
        $permanentPath = 'images/'.$filename;
        $disk->copy($stagingKey, $permanentPath);
        $disk->delete($stagingKey);

        $image = $scene->images()->create([
            'name' => $name ?? $filename,
            'path' => $permanentPath,
            'size' => $size,
        ]);

        GenerateImagePreview::dispatch($image);

        return $image;
    }
}
