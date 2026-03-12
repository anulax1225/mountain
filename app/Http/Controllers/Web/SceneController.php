<?php

namespace App\Http\Controllers\Web;

use App\Actions\Image\DeleteImage;
use App\Http\Controllers\Controller;
use App\Http\Resources\SceneResource;
use App\Models\Image;
use App\Models\Scene;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SceneController extends Controller
{
    public function show(Request $request, Scene $scene): Response
    {
        $this->authorize('view', $scene->project);

        $scene->load(['project', 'images']);

        return Inertia::render('dashboard/SceneShow', [
            'scene' => new SceneResource($scene),
        ]);
    }

    public function destroyImage(Image $image, DeleteImage $deleteImage): RedirectResponse
    {
        $this->authorize('update', $image->scene->project);

        $deleteImage($image);

        return back();
    }
}
