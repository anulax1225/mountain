<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSceneRequest;
use App\Http\Requests\UpdateSceneRequest;
use App\Http\Resources\SceneResource;
use App\Models\Project;
use App\Models\Scene;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * @group Scenes
 * 
 * APIs for managing scenes within projects
 */
class SceneController extends Controller
{
    /**
     * List project scenes
     *
     * Get a paginated list of all scenes for a specific project.
     *
     * @authenticated
     *
     * @urlParam project string required The slug of the project. Example: 550e8400-e29b-41d4-a716-446655440000
     *
     * @apiResourceCollection App\Http\Resources\SceneResource
     * @apiResourceModel App\Models\Scene
     */
    public function index(Project $project): AnonymousResourceCollection
    {
        $this->authorize('view', $project);
        
        $scenes = $project->scenes()->paginate(15);
        
        return SceneResource::collection($scenes);
    }

    /**
     * Create a scene
     *
     * Create a new scene within a project.
     *
     * @authenticated
     *
     * @urlParam project string required The slug of the project. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam name string The name of the scene. Example: Living Room
     *
     * @apiResource 201 App\Http\Resources\SceneResource
     * @apiResourceModel App\Models\Scene
     */
    public function store(StoreSceneRequest $request, Project $project): SceneResource
    {
        $this->authorize('update', $project);

        $scene = $project->scenes()->create($request->validated());
        
        return new SceneResource($scene);
    }

    /**
     * Get a scene
     *
     * Get a single scene with its details.
     *
     * @authenticated
     *
     * @urlParam project string required The slug of the project. Example: 550e8400-e29b-41d4-a716-446655440000
     * @urlParam scene string required The slug of the scene. Example: 660e8400-e29b-41d4-a716-446655440000
     *
     * @apiResource App\Http\Resources\SceneResource
     * @apiResourceModel App\Models\Scene with=project,images
     */
    public function show(Scene $scene): SceneResource
    {
        $this->authorize('view', $scene->project);
        $this->authorize('view', $scene);
        
        $scene->load([
            'project',
            'images',
        ]);
        
        return new SceneResource($scene);
    }

    /**
     * Update a scene
     *
     * Update an existing scene.
     *
     * @authenticated
     *
     * @urlParam project string required The slug of the project. Example: 550e8400-e29b-41d4-a716-446655440000
     * @urlParam scene string required The slug of the scene. Example: 660e8400-e29b-41d4-a716-446655440000
     * @bodyParam name string The name of the scene. Example: Updated Scene Name
     *
     * @apiResource App\Http\Resources\SceneResource
     * @apiResourceModel App\Models\Scene
     */
    public function update(UpdateSceneRequest $request, Scene $scene): SceneResource
    {
        $this->authorize('update', $scene->project);

        $scene->update($request->validated());
        
        return new SceneResource($scene);
    }

    /**
     * Delete a scene
     * 
     * Delete a scene and all its associated data.
     * 
     * @authenticated
     * 
     * @urlParam project string required The slug of the project. Example: 550e8400-e29b-41d4-a716-446655440000
     * @urlParam scene string required The slug of the scene. Example: 660e8400-e29b-41d4-a716-446655440000
     * 
     * @response 204
     */
    public function destroy(Scene $scene): Response
    {
        $this->authorize('update', $scene->project);
        $this->authorize('delete', $scene);

        $scene->delete();
        
        return response()->noContent();
    }
}