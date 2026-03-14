<?php

namespace App\Actions\Admin;

use App\Mail\UserInvitation;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class CreateUser
{
    /**
     * @return array{user: User, message: string}
     */
    public function __invoke(array $data): array
    {
        $invitationToken = Str::random(64);

        $user = User::create([
            'name' => $data['name'] ?? explode('@', $data['email'])[0],
            'email' => $data['email'],
            'password' => Hash::make(Str::random(32)),
            'invitation_token' => $invitationToken,
            'invitation_sent_at' => now(),
        ]);

        if (! empty($data['role_id'])) {
            $user->roles()->attach($data['role_id']);
        }

        $invitationUrl = url('/register/invitation/'.$invitationToken);
        Mail::to($user->email)->send(new UserInvitation($user, $invitationUrl));

        return [
            'user' => $user,
            'message' => 'Utilisateur créé et invitation envoyée',
        ];
    }
}
