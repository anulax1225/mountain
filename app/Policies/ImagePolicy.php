<?php

namespace App\Policies;

use App\Models\Image;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ImagePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Image $image): bool
    {
        $project = $image->scene->project;

        if ($project->is_public) {
            return true;
        }

        if ($user->isAdmin()) {
            return true;
        }

        if ($user->id === $project->user_id) {
            return true;
        }

        return $user->canAccessProject($project, 'view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Image $image): bool
    {
        $project = $image->scene->project;

        if ($user->isAdmin()) {
            return true;
        }

        if ($user->id === $project->user_id) {
            return true;
        }

        return $user->canAccessProject($project, 'update');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Image $image): bool
    {
        $project = $image->scene->project;

        if ($user->isAdmin()) {
            return true;
        }

        if ($user->id === $project->user_id) {
            return true;
        }

        return $user->canAccessProject($project, 'update');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Image $image): bool
    {
        $project = $image->scene->project;

        if ($user->isAdmin()) {
            return true;
        }

        return $user->id === $project->user_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Image $image): bool
    {
        $project = $image->scene->project;

        if ($user->isAdmin()) {
            return true;
        }

        return $user->id === $project->user_id;
    }
}