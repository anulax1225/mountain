<?php

namespace App\Actions\Image;

use App\Models\Image;
use App\Models\Scene;
use Illuminate\Support\Facades\DB;

class ReorderImages
{
    /**
     * Reorder images within a scene.
     *
     * @param  array<int, string>  $slugs  Ordered array of image slugs
     */
    public function __invoke(Scene $scene, array $slugs): void
    {
        DB::transaction(function () use ($scene, $slugs) {
            foreach ($slugs as $position => $slug) {
                Image::where('slug', $slug)
                    ->where('scene_id', $scene->id)
                    ->update(['position' => $position]);
            }
        });
    }
}
