<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view any models.
     * Only admins can view all users.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can view the model.
     * Admins can view any user, users can view themselves.
     */
    public function view(User $user, User $model): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->id === $model->id;
    }

    /**
     * Determine whether the user can create models.
     * Only admins can create users (invite).
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the model.
     * Admins can update any user, users can update themselves.
     */
    public function update(User $user, User $model): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->id === $model->id;
    }

    /**
     * Determine whether the user can delete the model.
     * Only admins can delete users (but not themselves).
     */
    public function delete(User $user, User $model): bool
    {
        if (!$user->isAdmin()) {
            return false;
        }

        // Admins cannot delete themselves
        return $user->id !== $model->id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, User $model): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, User $model): bool
    {
        if (!$user->isAdmin()) {
            return false;
        }

        return $user->id !== $model->id;
    }

    /**
     * Determine whether the user can manage roles.
     * Only admins can manage user roles.
     */
    public function manageRoles(User $user): bool
    {
        return $user->isAdmin();
    }
}
