<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * @group Projects
 * 
 * APIs for managing projects
 */
class ProjectController extends Controller
{
    /**
     * List projects
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $projects = $request->user()->projects()->with('scenes')->paginate(15);
        
        return ProjectResource::collection($projects);
    }

    /**
     * Create a project
     */
    public function store(StoreProjectRequest $request): ProjectResource
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;
        
        // Handle photo upload if present
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('project-photos', 'public');
            $data['photo'] = $path;
        }
        
        $project = Project::create($data);
        
        return new ProjectResource($project);
    }

    /**
     * Get a project
     */
    public function show(Project $project): ProjectResource
    {
        $this->authorize('view', $project);
        
        $project->load('scenes');
        
        return new ProjectResource($project);
    }

    /**
     * Update a project
     */
    public function update(UpdateProjectRequest $request, Project $project): ProjectResource
    {
        $this->authorize('update', $project);
        
        $data = $request->validated();
        
        // Handle photo upload if present
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($project->photo && Storage::disk('public')->exists($project->photo)) {
                Storage::disk('public')->delete($project->photo);
            }
            
            $path = $request->file('photo')->store('project-photos', 'public');
            $data['photo'] = $path;
        }
        
        $project->update($data);
        
        return new ProjectResource($project);
    }

    /**
     * Delete a project
     */
    public function destroy(Project $project): Response
    {
        $this->authorize('delete', $project);
        
        $project->delete();
        
        return response()->noContent();
    }
}