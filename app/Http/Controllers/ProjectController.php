<?php

namespace App\Http\Controllers;

use App\Http\Requests\MakeProjectPublicRequest;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Image;
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
     *
     * Admin sees all projects, others see only their own + assigned projects.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            // Admin sees all projects
            $projects = Project::with('scenes')->paginate(15);
        } else {
            // Get own projects + assigned projects
            $ownProjectIds = $user->projects()->pluck('id');
            $assignedProjectIds = $user->projectAccess()->pluck('projects.id');
            $allProjectIds = $ownProjectIds->merge($assignedProjectIds)->unique();

            $projects = Project::whereIn('id', $allProjectIds)
                ->with('scenes')
                ->paginate(15);
        }

        return ProjectResource::collection($projects);
    }

    /**
     * Create a project
     *
     * Only Admin users can create projects.
     */
    public function store(StoreProjectRequest $request): ProjectResource
    {
        $this->authorize('create', Project::class);

        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        // Handle photo upload if present
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('project-photos', 'public');
            $data['picture_path'] = $path;
            unset($data['photo']);
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
        
        $project->load(['scenes', 'startImage']);
        
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
            if ($project->picture_path && Storage::disk('public')->exists($project->picture_path)) {
                Storage::disk('public')->delete($project->picture_path);
            }

            $path = $request->file('photo')->store('project-photos', 'public');
            $data['picture_path'] = $path;
            unset($data['photo']);
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

    /**
     * Make a project public or private
     */
    public function makePublic(MakeProjectPublicRequest $request, Project $project): ProjectResource
    {
        $this->authorize('makePublic', $project);

        $data = $request->validated();
        $image = Image::where('slug', $data['start_image_id'])->first();
        if ($data['is_public'] && $image) {
            $project->update([
                'is_public' => true,
                'start_image_id' => $image->id,
            ]);
        } elseif ($data['is_public']) {
            $project->update([
                'is_public' => true,
            ]);
        } else {
            $project->update([
                'is_public' => false,
                'start_image_id' => null,
            ]);
        }

        return new ProjectResource($project);
    }

    /**
     * Get project images for start image selection
     */
    public function getImages(Project $project)
    {
        $this->authorize('view', $project);

        $images = $project->scenes()->with('images')->get()
            ->flatMap(function ($scene) {
                return $scene->images->map(function ($image) use ($scene) {
                    // Add scene info to each image for grouping in frontend
                    $imageArray = $image->toArray();
                    $imageArray['scene'] = [
                        'slug' => $scene->slug,
                        'name' => $scene->name,
                    ];
                    return $imageArray;
                });
            });

        return response()->json($images);
    }

    /**
     * Download/view project picture
     */
    public function downloadPicture(Project $project)
    {
        // Allow access if project is public or user has view permission
        if (!$project->is_public) {
            $this->authorize('view', $project);
        }

        if (!$project->picture_path) {
            abort(404, 'No picture available for this project');
        }

        $path = storage_path('app/public/' . $project->picture_path);

        if (!file_exists($path)) {
            abort(404, 'Picture file not found');
        }

        return response()->file($path);
    }
}