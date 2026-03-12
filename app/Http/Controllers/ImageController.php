<?php

namespace App\Http\Controllers;

use App\Actions\Image\DeleteImage;
use App\Actions\Image\ListImages;
use App\Actions\Image\StoreImage;
use App\Actions\Image\UpdateImage;
use App\Http\Requests\StoreImageRequest;
use App\Http\Requests\UpdateImageRequest;
use App\Http\Resources\ImageResource;
use App\Models\Image;
use App\Models\Scene;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * @group Images
 *
 * APIs for managing panoramic images within scenes
 */
class ImageController extends Controller
{
    /**
     * List scene images
     *
     * @authenticated
     *
     * @apiResourceCollection App\Http\Resources\ImageResource
     *
     * @apiResourceModel App\Models\Image with=hotspotsFrom.toImage,hotspotsTo.fromImage
     */
    public function index(Scene $scene, ListImages $listImages): AnonymousResourceCollection
    {
        $this->authorize('view', $scene->project);
        $this->authorize('view', $scene);

        return ImageResource::collection($listImages($scene));
    }

    /**
     * Upload an image
     *
     * @authenticated
     *
     * @apiResource 201 App\Http\Resources\ImageResource
     *
     * @apiResourceModel App\Models\Image
     */
    public function store(StoreImageRequest $request, Scene $scene, StoreImage $storeImage): ImageResource
    {
        $this->authorize('update', $scene->project);

        $image = $storeImage(
            $scene,
            $request->input('key'),
            $request->input('name'),
            $request->input('size'),
        );

        return new ImageResource($image);
    }

    /**
     * Get an image
     *
     * @authenticated
     *
     * @apiResource App\Http\Resources\ImageResource
     *
     * @apiResourceModel App\Models\Image with=hotspotsFrom,hotspotsTo
     */
    public function show(Image $image): ImageResource
    {
        $this->authorize('view', $image->scene->project);
        $this->authorize('view', $image->scene);
        $this->authorize('view', $image);

        $image->load(['hotspotsFrom', 'hotspotsTo']);

        return new ImageResource($image);
    }

    /**
     * Download an image
     *
     * @response 200 <binary>
     */
    public function download(Image $image): StreamedResponse
    {
        if (! $image->scene->project->is_public) {
            $this->authorize('view', $image);
        }

        $stream = Storage::disk('s3')->readStream($image->path);

        return response()->stream(function () use ($stream) {
            fpassthru($stream);
            fclose($stream);
        }, 200, [
            'Content-Type' => 'image/jpeg',
            'Content-Disposition' => 'inline; filename="'.basename($image->path).'"',
        ]);
    }

    /**
     * Update an image
     *
     * @authenticated
     *
     * @apiResource App\Http\Resources\ImageResource
     *
     * @apiResourceModel App\Models\Image
     */
    public function update(UpdateImageRequest $request, Image $image, UpdateImage $updateImage): ImageResource
    {
        $this->authorize('update', $image->scene->project);
        $this->authorize('update', $image);

        $image = $updateImage(
            $image,
            $request->validated(),
            $request->file('image'),
        );

        return new ImageResource($image);
    }

    /**
     * Delete an image
     *
     * @authenticated
     *
     * @response 204
     */
    public function destroy(Image $image, DeleteImage $deleteImage): Response
    {
        $this->authorize('update', $image->scene->project);
        $this->authorize('delete', $image);

        $deleteImage($image);

        return response()->noContent();
    }
}
