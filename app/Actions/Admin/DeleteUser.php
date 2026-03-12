<?php

namespace App\Actions\Admin;

use App\Models\User;

class DeleteUser
{
    public function __invoke(User $user): void
    {
        $user->delete();
    }
}
