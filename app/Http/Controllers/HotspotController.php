<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreHotspotRequest;
use App\Http\Requests\UpdateHotspotRequest;
use App\Http\Resources\HotspotResource;
use App\Models\Hotspot;
use App\Models\Project;
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
     * Get a paginated list of all hotspots for a specific scene.
     * 
     * @authenticated
     * 
     * @urlParam project string required The slug of the project. Example: 550e8400-e29b-41d4-a716-446655440000
     * @urlParam scene string required The slug of the scene. Example: 660e8400-e29b-41d4-a716-446655440000
     * 
     * @response 200 {
     *   "data": [
     *     {
     *       "slug": "880e8400-e29b-41d4-a716-446655440000",
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
        
        $hotspots = $scene->hotspots()->paginate(15);
        
        return HotspotResource::collection($hotspots);
    }

    /**
     * Create a hotspot
     * 
     * Create a new navigation hotspot within a scene.
     * 
     * @authenticated
     * 
     * @urlParam project string required The slug of the project. Example: 550e8400-e29b-41d4-a716-446655440000
     * @urlParam scene string required The slug of the scene. Example: 660e8400-e29b-41d4-a716-446655440000
     * @bodyParam from_image_id integer required The ID of the source image. Example: 1
     * @bodyParam to_image_id integer required The ID of the destination image. Example: 2
     * 
     * @response 201 {
     *   "data": {
     *     "slug": "880e8400-e29b-41d4-a716-446655440000",
     *     "created_at": "2024-01-01T00:00:00.000000Z",
     *     "updated_at": "2024-01-01T00:00:00.000000Z"
     *   }
     * }
     */
    public function store(StoreHotspotRequest $request, Scene $scene): HotspotResource
    {
        $this->authorize('view', $scene->project);
        $this->authorize('view', $scene);
        
        $hotspot = $scene->hotspots()->create($request->validated());
        
        return new HotspotResource($hotspot);
    }

    /**
     * Get a hotspot
     * 
     * Get a single hotspot with its from and to images.
     * 
     * @authenticated
     * 
     * @urlParam project string required The slug of the project. Example: 550e8400-e29b-41d4-a716-446655440000
     * @urlParam scene string required The slug of the scene. Example: 660e8400-e29b-41d4-a716-446655440000
     * @urlParam hotspot string required The slug of the hotspot. Example: 880e8400-e29b-41d4-a716-446655440000
     * 
     * @response 200 {
     *   "data": {
     *     "slug": "880e8400-e29b-41d4-a716-446655440000",
     *     "created_at": "2024-01-01T00:00:00.000000Z",
     *     "updated_at": "2024-01-01T00:00:00.000000Z",
     *     "from_image": {...},
     *     "to_image": {...}
     *   }
     * }
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
     * Update an existing hotspot's connections.
     * 
     * @authenticated
     * 
     * @urlParam project string required The slug of the project. Example: 550e8400-e29b-41d4-a716-446655440000
     * @urlParam scene string required The slug of the scene. Example: 660e8400-e29b-41d4-a716-446655440000
     * @urlParam hotspot string required The slug of the hotspot. Example: 880e8400-e29b-41d4-a716-446655440000
     * @bodyParam from_image_id integer The ID of the source image. Example: 1
     * @bodyParam to_image_id integer The ID of the destination image. Example: 3
     * 
     * @response 200 {
     *   "data": {
     *     "slug": "880e8400-e29b-41d4-a716-446655440000",
     *     "created_at": "2024-01-01T00:00:00.000000Z",
     *     "updated_at": "2024-01-01T01:00:00.000000Z"
     *   }
     * }
     */
    public function update(UpdateHotspotRequest $request, Hotspot $hotspot): HotspotResource
    {
        $this->authorize('view', $hotspot->scene->project);
        $this->authorize('view', $hotspot->scene);
        
        $hotspot->update($request->validated());
        
        return new HotspotResource($hotspot);
    }

    /**
     * Delete a hotspot
     * 
     * Delete a navigation hotspot.
     * 
     * @authenticated
     * 
     * @urlParam project string required The slug of the project. Example: 550e8400-e29b-41d4-a716-446655440000
     * @urlParam scene string required The slug of the scene. Example: 660e8400-e29b-41d4-a716-446655440000
     * @urlParam hotspot string required The slug of the hotspot. Example: 880e8400-e29b-41d4-a716-446655440000
     * 
     * @response 204
     */
    public function destroy(Hotspot $hotspot): Response
    {
        $this->authorize('view', $hotspot->scene->project);
        $this->authorize('view', $hotspot->scene);
        $this->authorize('delete', $hotspot);
        
        $hotspot->delete();
        
        return response()->noContent();
    }
}