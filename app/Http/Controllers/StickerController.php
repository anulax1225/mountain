<?php

namespace App\Http\Controllers;

use App\Actions\Sticker\CreateSticker;
use App\Actions\Sticker\DeleteSticker;
use App\Actions\Sticker\ListStickers;
use App\Actions\Sticker\UpdateSticker;
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
     * @authenticated
     *
     * @apiResourceCollection App\Http\Resources\StickerResource
     *
     * @apiResourceModel App\Models\Sticker
     */
    public function index(Image $image, ListStickers $listStickers): AnonymousResourceCollection
    {
        $this->authorize('view', $image->scene->project);
        $this->authorize('view', $image->scene);

        return StickerResource::collection($listStickers($image));
    }

    /**
     * Create a sticker
     *
     * @authenticated
     *
     * @apiResource 201 App\Http\Resources\StickerResource
     *
     * @apiResourceModel App\Models\Sticker
     */
    public function store(StoreStickerRequest $request, Image $image, CreateSticker $createSticker): StickerResource
    {
        $this->authorize('update', $image->scene->project);

        $sticker = $createSticker($image, $request->validated());

        return new StickerResource($sticker);
    }

    /**
     * Get a sticker
     *
     * @authenticated
     *
     * @apiResource App\Http\Resources\StickerResource
     *
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
     * @authenticated
     *
     * @apiResource App\Http\Resources\StickerResource
     *
     * @apiResourceModel App\Models\Sticker
     */
    public function update(UpdateStickerRequest $request, Sticker $sticker, UpdateSticker $updateSticker): StickerResource
    {
        $this->authorize('update', $sticker->image->scene->project);
        $this->authorize('update', $sticker);

        $sticker = $updateSticker($sticker, $request->validated());

        return new StickerResource($sticker);
    }

    /**
     * Delete a sticker
     *
     * @authenticated
     */
    public function destroy(Sticker $sticker, DeleteSticker $deleteSticker): Response
    {
        $this->authorize('update', $sticker->image->scene->project);
        $this->authorize('delete', $sticker);

        $deleteSticker($sticker);

        return response()->noContent();
    }
}
