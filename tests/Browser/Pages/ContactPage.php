<?php

namespace Tests\Browser\Pages;

use Laravel\Dusk\Browser;

class ContactPage extends Page
{
    /**
     * Get the URL for the page.
     */
    public function url(): string
    {
        return '/contact';
    }

    /**
     * Assert that the browser is on the page.
     */
    public function assert(Browser $browser): void
    {
        $browser->assertSee('Contactez-nous');
    }

    /**
     * Get the element shortcuts for the page.
     *
     * @return array<string, string>
     */
    public function elements(): array
    {
        return [
            '@name' => 'input[id="name"]',
            '@email' => 'input[id="email"]',
            '@message' => 'textarea[id="message"]',
            '@submit' => 'button[type="submit"]',
        ];
    }

    /**
     * Fill in and submit the contact form.
     */
    public function submitForm(Browser $browser, string $name, string $email, string $message): void
    {
        $browser->type('@name', $name)
            ->type('@email', $email)
            ->type('@message', $message)
            ->click('@submit');
    }
}
