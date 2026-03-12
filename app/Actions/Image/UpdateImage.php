<?php

namespace App\Actions\Image;

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

            $path = $file->store('images', 's3');
            $updateData['path'] = $path;
            $updateData['size'] = $file->getSize();
        }

        if (! empty($updateData)) {
            $image->update($updateData);
        }

        return $image;
    }
}
