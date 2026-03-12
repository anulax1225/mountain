<?php

namespace Tests\Browser\Pages;

use Laravel\Dusk\Browser;

class GalleryPage extends Page
{
    /**
     * Get the URL for the page.
     */
    public function url(): string
    {
        return '/gallery';
    }

    /**
     * Assert that the browser is on the page.
     */
    public function assert(Browser $browser): void
    {
        $browser->assertPathIs('/gallery');
    }

    /**
     * Get the element shortcuts for the page.
     *
     * @return array<string, string>
     */
    public function elements(): array
    {
        return [
            '@project-cards' => '[data-testid="gallery-project-card"]',
        ];
    }
}
