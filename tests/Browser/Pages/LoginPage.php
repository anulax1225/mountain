<?php

namespace Tests\Browser\Pages;

use Laravel\Dusk\Browser;

class LoginPage extends Page
{
    /**
     * Get the URL for the page.
     */
    public function url(): string
    {
        return '/login';
    }

    /**
     * Assert that the browser is on the page.
     */
    public function assert(Browser $browser): void
    {
        $browser->waitForText('Bon retour')
            ->waitFor('input[id="email"]');
    }

    /**
     * Get the element shortcuts for the page.
     *
     * @return array<string, string>
     */
    public function elements(): array
    {
        return [
            '@email' => 'input[id="email"]',
            '@password' => 'input[id="password"]',
            '@submit' => 'button[type="submit"]',
        ];
    }

    /**
     * Log in with the given credentials.
     */
    public function loginWithCredentials(Browser $browser, string $email, string $password): void
    {
        $browser->type('@email', $email)
            ->type('@password', $password)
            ->click('@submit');
    }
}
