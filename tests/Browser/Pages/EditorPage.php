<?php

namespace Tests\Browser\Pages;

use Laravel\Dusk\Browser;

class EditorPage extends Page
{
    /**
     * Create a new page instance.
     */
    public function __construct(protected string $slug) {}

    /**
     * Get the URL for the page.
     */
    public function url(): string
    {
        return "/dashboard/editor/{$this->slug}";
    }

    /**
     * Assert that the browser is on the page.
     */
    public function assert(Browser $browser): void
    {
        $browser->assertPathIs($this->url());
    }

    /**
     * Get the element shortcuts for the page.
     *
     * @return array<string, string>
     */
    public function elements(): array
    {
        return [
            '@canvas' => 'canvas',
            '@nav-buttons' => '[data-testid="editor-nav"]',
            '@scene-selector' => '[data-testid="scene-selector"]',
        ];
    }
}
