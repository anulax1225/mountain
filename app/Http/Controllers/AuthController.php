<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AuthController extends Controller
{
    /**
     * Login and create API token
     *
     * @group Authentication
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    /**
     * Logout and revoke token
     *
     * @group Authentication
     * @authenticated
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Get authenticated user
     *
     * @group Authentication
     * @authenticated
     */
    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Register a new user
     *
     * @group Authentication
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ], 201);
    }

        /**
     * Handle web login
     */
    public function webLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            $request->session()->regenerate();
            return redirect()->intended('/dashboard');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ]);
    }

    /**
     * Handle web registration
     */
    public function webRegister(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return redirect('/dashboard');
    }

    /**
     * Handle web logout
     */
    public function webLogout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Show the invitation registration form
     */
    public function showInvitationForm(string $token)
    {
        $user = User::where('invitation_token', $token)->first();

        if (!$user) {
            return redirect('/login')->withErrors([
                'token' => 'Ce lien d\'invitation est invalide ou a expiré.',
            ]);
        }

        if ($user->invitation_accepted_at) {
            return redirect('/login')->withErrors([
                'token' => 'Cette invitation a déjà été utilisée. Veuillez vous connecter.',
            ]);
        }

        // Check if invitation is older than 7 days
        if ($user->invitation_sent_at && $user->invitation_sent_at->addDays(7)->isPast()) {
            return redirect('/login')->withErrors([
                'token' => 'Ce lien d\'invitation a expiré. Contactez un administrateur.',
            ]);
        }

        return Inertia::render('auth/CompleteRegistration', [
            'token' => $token,
            'email' => $user->email,
            'name' => $user->name,
        ]);
    }

    /**
     * Complete the invitation registration
     */
    public function completeInvitation(Request $request, string $token)
    {
        $user = User::where('invitation_token', $token)->first();

        if (!$user) {
            return back()->withErrors([
                'token' => 'Ce lien d\'invitation est invalide ou a expiré.',
            ]);
        }

        if ($user->invitation_accepted_at) {
            return redirect('/login')->withErrors([
                'token' => 'Cette invitation a déjà été utilisée.',
            ]);
        }

        // Check if invitation is older than 7 days
        if ($user->invitation_sent_at && $user->invitation_sent_at->addDays(7)->isPast()) {
            return back()->withErrors([
                'token' => 'Ce lien d\'invitation a expiré. Contactez un administrateur.',
            ]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user->update([
            'name' => $validated['name'],
            'password' => Hash::make($validated['password']),
            'invitation_token' => null,
            'invitation_accepted_at' => now(),
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return redirect('/dashboard');
    }
}