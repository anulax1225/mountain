<?php

namespace Database\Seeders;

use App\Models\ContactRequest;
use Illuminate\Database\Seeder;

class ContactRequestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding contact requests...');

        // Create some received (new) requests
        ContactRequest::factory()
            ->count(5)
            ->received()
            ->inquiry()
            ->create();

        $this->command->info('  ✓ Created 5 new contact requests');

        // Create some in-process requests
        ContactRequest::factory()
            ->count(3)
            ->inProcess()
            ->create();

        $this->command->info('  ✓ Created 3 in-process contact requests');

        // Create some validated requests
        ContactRequest::factory()
            ->count(4)
            ->validated()
            ->create();

        $this->command->info('  ✓ Created 4 validated contact requests');

        // Create some refused requests
        ContactRequest::factory()
            ->count(2)
            ->refused()
            ->create();

        $this->command->info('  ✓ Created 2 refused contact requests');

        // Create some partnership proposals
        ContactRequest::factory()
            ->count(2)
            ->partnership()
            ->randomStatus()
            ->create();

        $this->command->info('  ✓ Created 2 partnership proposals');

        $total = ContactRequest::count();
        $this->command->info("✓ Total contact requests: {$total}");
    }
}
