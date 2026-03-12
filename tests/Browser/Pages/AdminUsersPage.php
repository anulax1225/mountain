<?php

namespace Tests\Browser\Pages;

use Laravel\Dusk\Browser;

class AdminUsersPage extends Page
{
    /**
     * Get the URL for the page.
     */
    public function url(): string
    {
        return '/dashboard/admin/users';
    }

    /**
     * Assert that the browser is on the page.
     */
    public function assert(Browser $browser): void
    {
        $browser->assertSee('Utilisateurs');
    }

    /**
     * Get the element shortcuts for the page.
     *
     * @return array<string, string>
     */
    public function elements(): array
    {
        return [
            '@users-table' => '[data-testid="users-table"]',
            '@create-user-btn' => '[data-testid="create-user"]',
        ];
    }
}
