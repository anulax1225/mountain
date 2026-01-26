<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStickerRequest;
use App\Http\Requests\UpdateStickerRequest;
use App\Http\Resources\StickerResource;
use App\Models\Image;
use App\Models\Sticker;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * @group Stickers
 * 
 * APIs for managing stickers (emojis, images, text) within images
 */
class StickerController extends Controller
{
    /**
     * List image stickers
     *
     * Get a paginated list of all stickers for a specific image.
     *
     * @authenticated
     *
     * @apiResourceCollection App\Http\Resources\StickerResource
     * @apiResourceModel App\Models\Sticker
     */
    public function index(Image $image): AnonymousResourceCollection
    {
        $this->authorize('view', $image->scene->project);
        $this->authorize('view', $image->scene);
        
        $stickers = $image->stickers()->paginate(50);
        
        return StickerResource::collection($stickers);
    }

    /**
     * Create a sticker
     *
     * Create a new sticker within an image.
     *
     * @authenticated
     *
     * @apiResource 201 App\Http\Resources\StickerResource
     * @apiResourceModel App\Models\Sticker
     */
    public function store(StoreStickerRequest $request, Image $image): StickerResource
    {
        $this->authorize('update', $image->scene->project);

        $sticker = $image->stickers()->create($request->validated());
        
        return new StickerResource($sticker);
    }

    /**
     * Get a sticker
     *
     * Get a single sticker by its slug.
     *
     * @authenticated
     *
     * @apiResource App\Http\Resources\StickerResource
     * @apiResourceModel App\Models\Sticker
     */
    public function show(Sticker $sticker): StickerResource
    {
        $this->authorize('view', $sticker->image->scene->project);
        $this->authorize('view', $sticker->image->scene);
        
        return new StickerResource($sticker);
    }

    /**
     * Update a sticker
     *
     * Update an existing sticker.
     *
     * @authenticated
     *
     * @apiResource App\Http\Resources\StickerResource
     * @apiResourceModel App\Models\Sticker
     */
    public function update(UpdateStickerRequest $request, Sticker $sticker): StickerResource
    {
        $this->authorize('update', $sticker->image->scene->project);
        $this->authorize('update', $sticker);

        $sticker->update($request->validated());
        
        return new StickerResource($sticker);
    }

    /**
     * Delete a sticker
     * 
     * Delete a sticker.
     * 
     * @authenticated
     */
    public function destroy(Sticker $sticker): Response
    {
        $this->authorize('update', $sticker->image->scene->project);
        $this->authorize('delete', $sticker);

        $sticker->delete();
        
        return response()->noContent();
    }
}