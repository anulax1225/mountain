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
     * @response 200 {
     *   "data": [
     *     {
     *       "slug": "770e8400-e29b-41d4-a716-446655440000",
     *       "path": "images/panorama.jpg",
     *       "size": 2048576,
     *       "created_at": "2024-01-01T00:00:00.000000Z",
     *       "updated_at": "2024-01-01T00:00:00.000000Z"
     *     }
     *   ],
     *   "links": {...},
     *   "meta": {...}
     * }
     */
    public function index(Scene $scene): AnonymousResourceCollection
    {
        $this->authorize('view', $scene->project);
        $this->authorize('view', $scene);
        
        $images = $scene->images()->paginate(15);
        
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
     * 
     * @response 201 {
     *   "data": {
     *     "slug": "770e8400-e29b-41d4-a716-446655440000",
     *     "path": "images/panorama.jpg",
     *     "size": 2048576,
     *     "created_at": "2024-01-01T00:00:00.000000Z",
     *     "updated_at": "2024-01-01T00:00:00.000000Z"
     *   }
     * }
     */
    public function store(StoreImageRequest $request, Scene $scene): ImageResource
    {
        $this->authorize('view', $scene->project);
        $this->authorize('view', $scene);
        
        $file = $request->file('image');
        $path = $file->store('images', 'public');
        
        $image = $scene->images()->create([
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
     * @response 200 {
     *   "data": {
     *     "slug": "770e8400-e29b-41d4-a716-446655440000",
     *     "path": "images/panorama.jpg",
     *     "size": 2048576,
     *     "created_at": "2024-01-01T00:00:00.000000Z",
     *     "updated_at": "2024-01-01T00:00:00.000000Z",
     *     "hotspots_from": [...],
     *     "hotspots_to": [...]
     *   }
     * }
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
        //$this->authorize('view', $image);
        
        return Storage::disk('public')->download($image->path);
    }

    /**
     * Update an image
     * 
     * Replace an existing image with a new file.
     * 
     * @authenticated
     * 
     * @urlParam project string required The slug of the project. Example: 550e8400-e29b-41d4-a716-446655440000
     * @urlParam scene string required The slug of the scene. Example: 660e8400-e29b-41d4-a716-446655440000
     * @urlParam image string required The slug of the image. Example: 770e8400-e29b-41d4-a716-446655440000
     * @bodyParam image file The new image file (max 20MB). Example: public/pano/pano2.jpeg
     * 
     * @response 200 {
     *   "data": {
     *     "slug": "770e8400-e29b-41d4-a716-446655440000",
     *     "path": "images/new-panorama.jpg",
     *     "size": 2148576,
     *     "created_at": "2024-01-01T00:00:00.000000Z",
     *     "updated_at": "2024-01-01T01:00:00.000000Z"
     *   }
     * }
     */
    public function update(UpdateImageRequest $request, Image $image): ImageResource
    {
        $this->authorize('view', $image->scene->project);
        $this->authorize('view', $image->scene);
        
        if ($request->hasFile('image')) {
            Storage::disk('public')->delete($image->path);
            
            $file = $request->file('image');
            $path = $file->store('images', 'public');
            
            $image->update([
                'path' => $path,
                'size' => $file->getSize(),
            ]);
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
        $this->authorize('view', $image->scene->project);
        $this->authorize('view', $image->scene);
        $this->authorize('delete', $image);
        
        Storage::disk('public')->delete($image->path);
        $image->delete();
        
        return response()->noContent();
    }
}