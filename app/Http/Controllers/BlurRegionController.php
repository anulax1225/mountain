<?php

namespace App\Http\Controllers;

use App\Actions\BlurRegion\CreateBlurRegion;
use App\Actions\BlurRegion\DeleteBlurRegion;
use App\Actions\BlurRegion\ListBlurRegions;
use App\Actions\BlurRegion\UpdateBlurRegion;
use App\Http\Requests\StoreBlurRegionRequest;
use App\Http\Requests\UpdateBlurRegionRequest;
use App\Http\Resources\BlurRegionResource;
use App\Models\BlurRegion;
use App\Models\Image;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * @group Blur Regions
 *
 * APIs for managing blur regions within images
 */
class BlurRegionController extends Controller
{
    /**
     * List image blur regions
     *
     * @authenticated
     *
     * @apiResourceCollection App\Http\Resources\BlurRegionResource
     *
     * @apiResourceModel App\Models\BlurRegion
     */
    public function index(Image $image, ListBlurRegions $listBlurRegions): AnonymousResourceCollection
    {
        $this->authorize('view', $image->scene->project);
        $this->authorize('view', $image->scene);

        return BlurRegionResource::collection($listBlurRegions($image));
    }

    /**
     * Create a blur region
     *
     * @authenticated
     *
     * @apiResource 201 App\Http\Resources\BlurRegionResource
     *
     * @apiResourceModel App\Models\BlurRegion
     */
    public function store(StoreBlurRegionRequest $request, Image $image, CreateBlurRegion $createBlurRegion): BlurRegionResource
    {
        $this->authorize('update', $image->scene->project);

        $blurRegion = $createBlurRegion($image, $request->validated());

        return new BlurRegionResource($blurRegion);
    }

    /**
     * Get a blur region
     *
     * @authenticated
     *
     * @apiResource App\Http\Resources\BlurRegionResource
     *
     * @apiResourceModel App\Models\BlurRegion
     */
    public function show(BlurRegion $blurRegion): BlurRegionResource
    {
        $this->authorize('view', $blurRegion->image->scene->project);
        $this->authorize('view', $blurRegion->image->scene);

        return new BlurRegionResource($blurRegion);
    }

    /**
     * Update a blur region
     *
     * @authenticated
     *
     * @apiResource App\Http\Resources\BlurRegionResource
     *
     * @apiResourceModel App\Models\BlurRegion
     */
    public function update(UpdateBlurRegionRequest $request, BlurRegion $blurRegion, UpdateBlurRegion $updateBlurRegion): BlurRegionResource
    {
        $this->authorize('update', $blurRegion->image->scene->project);
        $this->authorize('update', $blurRegion);

        $blurRegion = $updateBlurRegion($blurRegion, $request->validated());

        return new BlurRegionResource($blurRegion);
    }

    /**
     * Delete a blur region
     *
     * @authenticated
     */
    public function destroy(BlurRegion $blurRegion, DeleteBlurRegion $deleteBlurRegion): Response
    {
        $this->authorize('update', $blurRegion->image->scene->project);
        $this->authorize('delete', $blurRegion);

        $deleteBlurRegion($blurRegion);

        return response()->noContent();
    }
}
