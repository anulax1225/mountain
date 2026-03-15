<?php

namespace App\Actions\Image;

use App\Jobs\GenerateImagePreview;
use App\Models\Image;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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

            $extension = $file->guessExtension() ?: 'jpg';
            $path = $file->storeAs('images', Str::uuid().'.'.$extension, 's3');
            $updateData['path'] = $path;
            $updateData['size'] = $file->getSize();
            $updateData['original_name'] = $file->getClientOriginalName();
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
