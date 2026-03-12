<?php

namespace Tests\Browser\Pages;

use Laravel\Dusk\Browser;

class DashboardPage extends Page
{
    /**
     * Get the URL for the page.
     */
    public function url(): string
    {
        return '/dashboard';
    }

    /**
     * Assert that the browser is on the page.
     */
    public function assert(Browser $browser): void
    {
        $browser->assertSee('Projets');
    }

    /**
     * Get the element shortcuts for the page.
     *
     * @return array<string, string>
     */
    public function elements(): array
    {
        return [
            '@project-cards' => '[data-testid="project-card"]',
            '@create-project-btn' => '[data-testid="create-project"]',
        ];
    }

    /**
     * Open the create project dialog or form.
     */
    public function openCreateProject(Browser $browser): void
    {
        $browser->click('@create-project-btn');
    }

    /**
     * Assert that a project with the given name is visible.
     */
    public function assertSeeProject(Browser $browser, string $name): void
    {
        $browser->assertSee($name);
    }
}
