<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreImageRequest;
use App\Http\Requests\UpdateImageRequest;
use App\Http\Resources\ImageResource;
use App\Models\Image;
use App\Models\Project;
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
     * Get a paginated list of all images for a specific scene.
     *
     * @authenticated
     *
     * @urlParam project string required The slug of the project. Example: 550e8400-e29b-41d4-a716-446655440000
     * @urlParam scene string required The slug of the scene. Example: 660e8400-e29b-41d4-a716-446655440000
     *
     * @apiResourceCollection App\Http\Resources\ImageResource
     * @apiResourceModel App\Models\Image with=hotspotsFrom.toImage,hotspotsTo.fromImage
     */
    public function index(Scene $scene): AnonymousResourceCollection
    {
        $this->authorize('view', $scene->project);
        $this->authorize('view', $scene);
        
        $images = $scene->images()
            ->with(['hotspotsFrom.toImage', 'hotspotsTo.fromImage'])
            ->paginate(15);
        
        return ImageResource::collection($images);
    }

    /**
     * Upload an image
     *
     * Upload a new panoramic image to a scene.
     *
     * @authenticated
     *
     * @urlParam project string required The slug of the project. Example: 550e8400-e29b-41d4-a716-446655440000
     * @urlParam scene string required The slug of the scene. Example: 660e8400-e29b-41d4-a716-446655440000
     * @bodyParam image file required The panoramic image file (max 20MB). Example: public/pano/pano1.jpeg
     * @bodyParam name string The name of the image. Example: Living Room View
     *
     * @apiResource 201 App\Http\Resources\ImageResource
     * @apiResourceModel App\Models\Image
     */
    public function store(StoreImageRequest $request, Scene $scene): ImageResource
    {
        $this->authorize('update', $scene->project);

        $file = $request->file('image');
        $path = $file->store('images', 's3');

        $image = $scene->images()->create([
            'name' => $request->input('name'),
            'path' => $path,
            'size' => $file->getSize(),
        ]);

        return new ImageResource($image);
    }

    /**
     * Get an image
     *
     * Get a single image with its details and hotspots.
     *
     * @authenticated
     *
     * @urlParam project string required The slug of the project. Example: 550e8400-e29b-41d4-a716-446655440000
     * @urlParam scene string required The slug of the scene. Example: 660e8400-e29b-41d4-a716-446655440000
     * @urlParam image string required The slug of the image. Example: 770e8400-e29b-41d4-a716-446655440000
     *
     * @apiResource App\Http\Resources\ImageResource
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
     * Download the actual image file.
     * 
     * @authenticated
     * 
     * @urlParam project string required The slug of the project. Example: 550e8400-e29b-41d4-a716-446655440000
     * @urlParam scene string required The slug of the scene. Example: 660e8400-e29b-41d4-a716-446655440000
     * @urlParam image string required The slug of the image. Example: 770e8400-e29b-41d4-a716-446655440000
     * 
     * @response 200 <binary>
     */
    public function download(Image $image): StreamedResponse
    {
        // Allow public project images, otherwise require authorization
        if (!$image->scene->project->is_public) {
            $this->authorize('view', $image);
        }

        $stream = Storage::disk('s3')->readStream($image->path);

        return response()->stream(function () use ($stream) {
            fpassthru($stream);
            fclose($stream);
        }, 200, [
            'Content-Type' => 'image/jpeg',
            'Content-Disposition' => 'inline; filename="' . basename($image->path) . '"',
        ]);
    }

    /**
     * Update an image
     *
     * Replace an existing image with a new file or update its name.
     *
     * @authenticated
     *
     * @urlParam project string required The slug of the project. Example: 550e8400-e29b-41d4-a716-446655440000
     * @urlParam scene string required The slug of the scene. Example: 660e8400-e29b-41d4-a716-446655440000
     * @urlParam image string required The slug of the image. Example: 770e8400-e29b-41d4-a716-446655440000
     * @bodyParam image file The new image file (max 20MB). Example: public/pano/pano2.jpeg
     * @bodyParam name string The name of the image. Example: Updated Living Room View
     *
     * @apiResource App\Http\Resources\ImageResource
     * @apiResourceModel App\Models\Image
     */
    public function update(UpdateImageRequest $request, Image $image): ImageResource
    {
        $this->authorize('update', $image->scene->project);
        $this->authorize('update', $image);

        $updateData = [];
        
        if ($request->has('name')) {
            $updateData['name'] = $request->input('name');
        }
        
        if ($request->hasFile('image')) {
            Storage::disk('s3')->delete($image->path);

            $file = $request->file('image');
            $path = $file->store('images', 's3');

            $updateData['path'] = $path;
            $updateData['size'] = $file->getSize();
        }
        
        if (!empty($updateData)) {
            $image->update($updateData);
        }
        
        return new ImageResource($image);
    }

    /**
     * Delete an image
     * 
     * Delete an image and its file from storage.
     * 
     * @authenticated
     * 
     * @urlParam project string required The slug of the project. Example: 550e8400-e29b-41d4-a716-446655440000
     * @urlParam scene string required The slug of the scene. Example: 660e8400-e29b-41d4-a716-446655440000
     * @urlParam image string required The slug of the image. Example: 770e8400-e29b-41d4-a716-446655440000
     * 
     * @response 204
     */
    public function destroy(Image $image): Response
    {
        $this->authorize('update', $image->scene->project);
        $this->authorize('delete', $image);

        Storage::disk('s3')->delete($image->path);
        $image->delete();

        return response()->noContent();
    }
}