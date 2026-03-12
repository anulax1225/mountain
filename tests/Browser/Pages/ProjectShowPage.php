<?php

namespace Tests\Browser\Pages;

use Laravel\Dusk\Browser;

class ProjectShowPage extends Page
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
        return "/dashboard/projects/{$this->slug}";
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
            '@scene-cards' => '[data-testid="scene-card"]',
            '@create-scene-btn' => '[data-testid="create-scene"]',
        ];
    }

    /**
     * Open the create scene dialog or form.
     */
    public function openCreateScene(Browser $browser): void
    {
        $browser->click('@create-scene-btn');
    }

    /**
     * Assert that a scene with the given name is visible.
     */
    public function assertSeeScene(Browser $browser, string $name): void
    {
        $browser->assertSee($name);
    }
}
