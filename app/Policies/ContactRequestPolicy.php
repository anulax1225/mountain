<?php

namespace App\Policies;

use App\Models\ContactRequest;
use App\Models\User;

class ContactRequestPolicy
{
    /**
     * Determine whether the user can view any models.
     * Only admins can view contact requests.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can view the model.
     * Only admins can view contact requests.
     */
    public function view(User $user, ContactRequest $contactRequest): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can create models.
     * Anyone can create a contact request (public form).
     */
    public function create(?User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     * Only admins can update contact requests.
     */
    public function update(User $user, ContactRequest $contactRequest): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the model.
     * Only admins can delete contact requests.
     */
    public function delete(User $user, ContactRequest $contactRequest): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ContactRequest $contactRequest): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ContactRequest $contactRequest): bool
    {
        return $user->isAdmin();
    }
}
