<?php

namespace App\Http\Controllers;

use App\Actions\Project\CreateProject;
use App\Actions\Project\DeleteProject;
use App\Actions\Project\GetProjectImages;
use App\Actions\Project\ListProjects;
use App\Actions\Project\MakeProjectPublic;
use App\Actions\Project\UpdateProject;
use App\Http\Requests\MakeProjectPublicRequest;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
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
     *
     * @authenticated
     *
     * @apiResourceCollection App\Http\Resources\ProjectResource
     *
     * @apiResourceModel App\Models\Project
     */
    public function index(Request $request, ListProjects $listProjects): AnonymousResourceCollection
    {
        return ProjectResource::collection($listProjects($request->user()));
    }

    /**
     * Create a project
     *
     * Only Admin users can create projects.
     *
     * @authenticated
     *
     * @apiResource 201 App\Http\Resources\ProjectResource
     *
     * @apiResourceModel App\Models\Project
     */
    public function store(StoreProjectRequest $request, CreateProject $createProject): ProjectResource
    {
        $this->authorize('create', Project::class);

        $project = $createProject(
            $request->validated(),
            $request->user(),
            $request->file('photo'),
        );

        return new ProjectResource($project);
    }

    /**
     * Get a project
     *
     * @authenticated
     *
     * @apiResource App\Http\Resources\ProjectResource
     *
     * @apiResourceModel App\Models\Project with=scenes,startImage
     */
    public function show(Project $project): ProjectResource
    {
        $this->authorize('view', $project);

        $project->load(['scenes', 'startImage']);

        return new ProjectResource($project);
    }

    /**
     * Update a project
     *
     * @authenticated
     *
     * @apiResource App\Http\Resources\ProjectResource
     *
     * @apiResourceModel App\Models\Project
     */
    public function update(UpdateProjectRequest $request, Project $project, UpdateProject $updateProject): ProjectResource
    {
        $this->authorize('update', $project);

        $project = $updateProject(
            $project,
            $request->validated(),
            $request->file('photo'),
        );

        return new ProjectResource($project);
    }

    /**
     * Delete a project
     */
    public function destroy(Project $project, DeleteProject $deleteProject): Response
    {
        $this->authorize('delete', $project);

        $deleteProject($project);

        return response()->noContent();
    }

    /**
     * Make a project public or private
     *
     * @authenticated
     *
     * @apiResource App\Http\Resources\ProjectResource
     *
     * @apiResourceModel App\Models\Project
     */
    public function makePublic(MakeProjectPublicRequest $request, Project $project, MakeProjectPublic $makeProjectPublic): ProjectResource
    {
        $this->authorize('makePublic', $project);

        $project = $makeProjectPublic($project, $request->validated());

        return new ProjectResource($project);
    }

    /**
     * Get project images for start image selection
     */
    public function getImages(Project $project, GetProjectImages $getProjectImages): JsonResponse
    {
        $this->authorize('view', $project);

        return response()->json($getProjectImages($project));
    }

    /**
     * Download/view project picture
     */
    public function downloadPicture(Project $project)
    {
        if (! $project->is_public) {
            $this->authorize('view', $project);
        }

        if (! $project->picture_path) {
            abort(404, 'No picture available for this project');
        }

        $stream = Storage::disk('s3')->readStream($project->picture_path);

        return response()->stream(function () use ($stream) {
            fpassthru($stream);
            fclose($stream);
        }, 200, [
            'Content-Type' => 'image/jpeg',
            'Content-Disposition' => 'inline; filename="'.basename($project->picture_path).'"',
        ]);
    }
}
