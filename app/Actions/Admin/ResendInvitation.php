<?php

namespace App\Actions\Admin;

use App\Mail\UserInvitation;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ResendInvitation
{
    public function __invoke(User $user): void
    {
        if (! $user->hasPendingInvitation()) {
            throw ValidationException::withMessages([
                'user' => ['Cet utilisateur a déjà complété son inscription'],
            ]);
        }

        $invitationToken = Str::random(64);
        $user->update([
            'invitation_token' => $invitationToken,
            'invitation_sent_at' => now(),
        ]);

        $invitationUrl = url('/register/invitation/'.$invitationToken);
        Mail::to($user->email)->send(new UserInvitation($user, $invitationUrl));
    }
}
