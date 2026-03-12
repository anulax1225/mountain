<?php

namespace App\Actions\Image;

use App\Models\Image;
use App\Models\Project;
use Illuminate\Support\Facades\Storage;

class DeleteImage
{
    public function __invoke(Image $image): void
    {
        $affectedProject = Project::where('start_image_id', $image->id)->first();

        Storage::disk('s3')->delete($image->path);

        if ($image->preview_path) {
            Storage::disk('s3')->delete($image->preview_path);
        }

        $image->delete();

        if ($affectedProject) {
            $affectedProject->update([
                'is_public' => false,
                'start_image_id' => null,
            ]);
        }
    }
}
