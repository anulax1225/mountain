<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * @group Projects
 * 
 * APIs for managing projects
 */
class ProjectController extends Controller
{
    /**
     * List all projects
     * 
     * Get a paginated list of all projects owned by the authenticated user.
     * 
     * @authenticated
     * 
     * @response 200 {
     *   "data": [
     *     {
     *       "slug": "550e8400-e29b-41d4-a716-446655440000",
     *       "name": "My Virtual Tour",
     *       "description": "A tour of my office",
     *       "created_at": "2024-01-01T00:00:00.000000Z",
     *       "updated_at": "2024-01-01T00:00:00.000000Z"
     *     }
     *   ],
     *   "links": {...},
     *   "meta": {...}
     * }
     */
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Project::class);
        
        $projects = auth()->user()->projects()->paginate(15);
        
        return ProjectResource::collection($projects);
    }

    /**
     * Create a project
     * 
     * Create a new project for the authenticated user.
     * 
     * @authenticated
     * 
     * @bodyParam name string required The name of the project. Example: My Virtual Tour
     * @bodyParam description string The description of the project. Example: A tour of my office
     * 
     * @response 201 {
     *   "data": {
     *     "slug": "550e8400-e29b-41d4-a716-446655440000",
     *     "name": "My Virtual Tour",
     *     "description": "A tour of my office",
     *     "created_at": "2024-01-01T00:00:00.000000Z",
     *     "updated_at": "2024-01-01T00:00:00.000000Z"
     *   }
     * }
     */
    public function store(StoreProjectRequest $request): ProjectResource
    {
        $project = auth()->user()->projects()->create($request->validated());
        
        return new ProjectResource($project);
    }

    /**
     * Get a project
     * 
     * Get a single project with its scenes.
     * 
     * @authenticated
     * 
     * @urlParam project string required The slug of the project. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 200 {
     *   "data": {
     *     "slug": "550e8400-e29b-41d4-a716-446655440000",
     *     "name": "My Virtual Tour",
     *     "description": "A tour of my office",
     *     "created_at": "2024-01-01T00:00:00.000000Z",
     *     "updated_at": "2024-01-01T00:00:00.000000Z",
     *     "scenes": [...]
     *   }
     * }
     */
    public function show(Project $project): ProjectResource
    {
        $this->authorize('view', $project);
        
        $project->load('scenes');
        
        return new ProjectResource($project);
    }

    /**
     * Update a project
     * 
     * Update an existing project.
     * 
     * @authenticated
     * 
     * @urlParam project string required The slug of the project. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam name string The name of the project. Example: Updated Tour Name
     * @bodyParam description string The description of the project. Example: Updated description
     * 
     * @response 200 {
     *   "data": {
     *     "slug": "550e8400-e29b-41d4-a716-446655440000",
     *     "name": "Updated Tour Name",
     *     "description": "Updated description",
     *     "created_at": "2024-01-01T00:00:00.000000Z",
     *     "updated_at": "2024-01-01T00:00:00.000000Z"
     *   }
     * }
     */
    public function update(UpdateProjectRequest $request, Project $project): ProjectResource
    {
        $project->update($request->validated());
        
        return new ProjectResource($project);
    }

    /**
     * Delete a project
     * 
     * Delete a project and all its associated data.
     * 
     * @authenticated
     * 
     * @urlParam project string required The slug of the project. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 204
     */
    public function destroy(Project $project): Response
    {
        $this->authorize('delete', $project);
        
        $project->delete();
        
        return response()->noContent();
    }
}