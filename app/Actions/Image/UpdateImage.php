<?php

namespace App\Actions\Image;

use App\Jobs\GenerateImagePreview;
use App\Models\Image;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class UpdateImage
{
    public function __invoke(Image $image, array $data, ?UploadedFile $file = null): Image
    {
        $updateData = [];

        if (isset($data['name'])) {
            $updateData['name'] = $data['name'];
        }

        if ($file) {
            Storage::disk('s3')->delete($image->path);

            if ($image->preview_path) {
                Storage::disk('s3')->delete($image->preview_path);
                $updateData['preview_path'] = null;
            }

            $path = $file->store('images', 's3');
            $updateData['path'] = $path;
            $updateData['size'] = $file->getSize();
        }

        if (! empty($updateData)) {
            $image->update($updateData);
        }

        if ($file) {
            GenerateImagePreview::dispatch($image);
        }

        return $image;
    }
}
