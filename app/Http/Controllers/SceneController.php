<?php

namespace App\Http\Controllers;

use App\Actions\Scene\CreateScene;
use App\Actions\Scene\DeleteScene;
use App\Actions\Scene\ListScenes;
use App\Actions\Scene\ReorderScenes;
use App\Actions\Scene\UpdateScene;
use App\Http\Requests\ReorderScenesRequest;
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
     * @authenticated
     *
     * @urlParam project string required The slug of the project. Example: 550e8400-e29b-41d4-a716-446655440000
     *
     * @apiResourceCollection App\Http\Resources\SceneResource
     *
     * @apiResourceModel App\Models\Scene
     */
    public function index(Project $project, ListScenes $listScenes): AnonymousResourceCollection
    {
        $this->authorize('view', $project);

        return SceneResource::collection($listScenes($project));
    }

    /**
     * Create a scene
     *
     * @authenticated
     *
     * @urlParam project string required The slug of the project. Example: 550e8400-e29b-41d4-a716-446655440000
     *
     * @bodyParam name string The name of the scene. Example: Living Room
     *
     * @apiResource 201 App\Http\Resources\SceneResource
     *
     * @apiResourceModel App\Models\Scene
     */
    public function store(StoreSceneRequest $request, Project $project, CreateScene $createScene): SceneResource
    {
        $this->authorize('update', $project);

        $scene = $createScene($project, $request->validated());

        return new SceneResource($scene);
    }

    /**
     * Get a scene
     *
     * @authenticated
     *
     * @apiResource App\Http\Resources\SceneResource
     *
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
     * @authenticated
     *
     * @apiResource App\Http\Resources\SceneResource
     *
     * @apiResourceModel App\Models\Scene
     */
    public function update(UpdateSceneRequest $request, Scene $scene, UpdateScene $updateScene): SceneResource
    {
        $this->authorize('update', $scene->project);

        $scene = $updateScene($scene, $request->validated());

        return new SceneResource($scene);
    }

    /**
     * Reorder scenes within a project
     *
     * @authenticated
     *
     * @response 204
     */
    public function reorder(ReorderScenesRequest $request, Project $project, ReorderScenes $reorderScenes): Response
    {
        $this->authorize('update', $project);

        $reorderScenes($project, $request->validated()['slugs']);

        return response()->noContent();
    }

    /**
     * Delete a scene
     *
     * @authenticated
     *
     * @response 204
     */
    public function destroy(Scene $scene, DeleteScene $deleteScene): Response
    {
        $this->authorize('update', $scene->project);
        $this->authorize('delete', $scene);

        $deleteScene($scene);

        return response()->noContent();
    }
}
