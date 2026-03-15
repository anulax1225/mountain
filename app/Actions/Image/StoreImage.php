<?php

namespace App\Actions\Image;

use App\Jobs\GenerateImagePreview;
use App\Models\Image;
use App\Models\Scene;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StoreImage
{
    public function __invoke(Scene $scene, string $stagingKey, ?string $name, int $size): Image
    {
        $disk = Storage::disk('s3');

        $originalFilename = basename($stagingKey);
        $extension = pathinfo($originalFilename, PATHINFO_EXTENSION) ?: 'jpg';
        $permanentPath = 'images/'.Str::uuid().'.'.$extension;
        $disk->copy($stagingKey, $permanentPath);
        $disk->delete($stagingKey);

        $nextPosition = ($scene->images()->max('position') ?? -1) + 1;

        $image = $scene->images()->create([
            'name' => $name ?? $originalFilename,
            'original_name' => $originalFilename,
            'path' => $permanentPath,
            'size' => $size,
            'position' => $nextPosition,
        ]);

        GenerateImagePreview::dispatch($image);

        return $image;
    }
}
