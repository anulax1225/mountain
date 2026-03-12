<?php

namespace App\Http\Controllers;

use App\Actions\Hotspot\CreateHotspot;
use App\Actions\Hotspot\DeleteHotspot;
use App\Actions\Hotspot\ListHotspots;
use App\Actions\Hotspot\UpdateHotspot;
use App\Http\Requests\StoreHotspotRequest;
use App\Http\Requests\UpdateHotspotRequest;
use App\Http\Resources\HotspotResource;
use App\Models\Hotspot;
use App\Models\Scene;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * @group Hotspots
 *
 * APIs for managing navigation hotspots within scenes
 */
class HotspotController extends Controller
{
    /**
     * List scene hotspots
     *
     * @authenticated
     *
     * @apiResourceCollection App\Http\Resources\HotspotResource
     *
     * @apiResourceModel App\Models\Hotspot
     */
    public function index(Scene $scene, ListHotspots $listHotspots): AnonymousResourceCollection
    {
        $this->authorize('view', $scene->project);
        $this->authorize('view', $scene);

        return HotspotResource::collection($listHotspots($scene));
    }

    /**
     * Create a hotspot
     *
     * @authenticated
     *
     * @apiResource 201 App\Http\Resources\HotspotResource
     *
     * @apiResourceModel App\Models\Hotspot
     */
    public function store(StoreHotspotRequest $request, Scene $scene, CreateHotspot $createHotspot): HotspotResource
    {
        $this->authorize('update', $scene->project);

        $hotspot = $createHotspot($scene, $request->validated());

        return new HotspotResource($hotspot);
    }

    /**
     * Get a hotspot
     *
     * @authenticated
     *
     * @apiResource App\Http\Resources\HotspotResource
     *
     * @apiResourceModel App\Models\Hotspot with=fromImage,toImage
     */
    public function show(Hotspot $hotspot): HotspotResource
    {
        $this->authorize('view', $hotspot->scene->project);
        $this->authorize('view', $hotspot->scene);
        $this->authorize('view', $hotspot);

        $hotspot->load(['fromImage', 'toImage']);

        return new HotspotResource($hotspot);
    }

    /**
     * Update a hotspot
     *
     * @authenticated
     *
     * @apiResource App\Http\Resources\HotspotResource
     *
     * @apiResourceModel App\Models\Hotspot
     */
    public function update(UpdateHotspotRequest $request, Hotspot $hotspot, UpdateHotspot $updateHotspot): HotspotResource
    {
        $this->authorize('update', $hotspot->scene->project);
        $this->authorize('update', $hotspot);

        $hotspot = $updateHotspot($hotspot, $request->validated());

        return new HotspotResource($hotspot);
    }

    /**
     * Delete a hotspot
     *
     * @authenticated
     *
     * @response 204
     */
    public function destroy(Hotspot $hotspot, DeleteHotspot $deleteHotspot): Response
    {
        $this->authorize('update', $hotspot->scene->project);
        $this->authorize('delete', $hotspot);

        $deleteHotspot($hotspot);

        return response()->noContent();
    }
}
