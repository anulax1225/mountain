<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Project;
use App\Models\Scene;
use App\Models\Image;
use App\Models\Hotspot;
use App\Models\Sticker;
use App\Models\ContactRequest;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('Seeding database...');

        // Create demo user
        $user = User::factory()->create([
            'name' => 'Demo User',
            'email' => 'demo@example.com',
            'password' => bcrypt('password'),
        ]);

        $this->command->info("✓ Created user: {$user->email}");

        // Create a sample project with scenes, images, and hotspots
        $this->createSampleProject($user);

        // Optionally create additional users with their own projects
        $this->command->newLine();
        if ($this->command->confirm('Create additional users with projects?', false)) {
            $count = $this->command->ask('How many users?', 3);
            $this->createAdditionalUsers((int) $count);
        }

        // Optionally seed contact requests
        $this->command->newLine();
        if ($this->command->confirm('Seed contact requests?', true)) {
            $this->call(ContactRequestSeeder::class);
        }

        $this->command->newLine();
        $this->command->info('✓ Database seeding completed!');
    }

    /**
     * Create a sample project with realistic data.
     *
     * @param User $user
     * @return void
     */
    protected function createSampleProject(User $user): void
    {
        $this->command->info('Creating sample project...');

        // Create a public project
        $project = Project::factory()
            ->public()
            ->create([
                'user_id' => $user->id,
                'name' => 'Virtual Office Tour',
                'description' => 'A complete virtual tour of our office space with multiple rooms and areas.',
            ]);

        $this->command->info("✓ Created project: {$project->name}");

        // Create multiple scenes
        $scenes = [
            'Reception Area' => 3, // 3 images
            'Conference Room' => 2, // 2 images
            'Main Office' => 4, // 4 images
        ];

        $allImages = [];

        foreach ($scenes as $sceneName => $imageCount) {
            $scene = Scene::factory()->create([
                'project_id' => $project->id,
                'name' => $sceneName,
            ]);

            $this->command->info("  ✓ Created scene: {$scene->name}");

            // Create images for this scene (using fake images)
            for ($i = 0; $i < $imageCount; $i++) {
                $image = Image::factory()
                    ->fake()
                    ->create([
                        'scene_id' => $scene->id,
                        'name' => "{$sceneName} - View " . ($i + 1),
                    ]);

                $allImages[] = $image;

                // Add some stickers to random images (30% chance)
                if (fake()->boolean(30)) {
                    $stickerCount = fake()->numberBetween(1, 3);
                    for ($s = 0; $s < $stickerCount; $s++) {
                        Sticker::factory()->create([
                            'image_id' => $image->id,
                        ]);
                    }
                }
            }
        }

        $this->command->info("  ✓ Created " . count($allImages) . " images");

        // Set first image as start image
        if (!empty($allImages)) {
            $project->update(['start_image_id' => $allImages[0]->id]);
        }

        // Create hotspots connecting images within each scene
        $hotspotCount = 0;
        foreach ($project->scenes as $scene) {
            $sceneImages = $scene->images->all();

            if (count($sceneImages) > 1) {
                // Connect images sequentially within the scene
                for ($i = 0; $i < count($sceneImages) - 1; $i++) {
                    Hotspot::factory()->create([
                        'scene_id' => $scene->id,
                        'from_image_id' => $sceneImages[$i]->id,
                        'to_image_id' => $sceneImages[$i + 1]->id,
                    ]);
                    $hotspotCount++;

                    // Add reverse hotspot (30% chance)
                    if (fake()->boolean(30)) {
                        Hotspot::factory()->create([
                            'scene_id' => $scene->id,
                            'from_image_id' => $sceneImages[$i + 1]->id,
                            'to_image_id' => $sceneImages[$i]->id,
                        ]);
                        $hotspotCount++;
                    }
                }
            }
        }

        $this->command->info("  ✓ Created {$hotspotCount} hotspots");
    }

    /**
     * Create additional users with their own projects.
     *
     * @param int $count
     * @return void
     */
    protected function createAdditionalUsers(int $count): void
    {
        $this->command->info("Creating {$count} additional users...");

        for ($i = 0; $i < $count; $i++) {
            $user = User::factory()->create();
            $this->command->info("  ✓ Created user: {$user->email}");

            // Create 1-3 projects for each user
            $projectCount = fake()->numberBetween(1, 3);

            for ($p = 0; $p < $projectCount; $p++) {
                $project = Project::factory()->create([
                    'user_id' => $user->id,
                ]);

                // Create 1-2 scenes per project
                $sceneCount = fake()->numberBetween(1, 2);

                for ($s = 0; $s < $sceneCount; $s++) {
                    $scene = Scene::factory()->create([
                        'project_id' => $project->id,
                    ]);

                    // Create 2-5 images per scene
                    $imageCount = fake()->numberBetween(2, 5);
                    $images = [];

                    for ($img = 0; $img < $imageCount; $img++) {
                        $images[] = Image::factory()
                            ->fake()
                            ->create([
                                'scene_id' => $scene->id,
                            ]);
                    }

                    // Set first image as start image
                    if (!empty($images) && $s === 0) {
                        $project->update(['start_image_id' => $images[0]->id]);
                    }

                    // Create some hotspots
                    if (count($images) > 1) {
                        for ($h = 0; $h < count($images) - 1; $h++) {
                            Hotspot::factory()->create([
                                'scene_id' => $scene->id,
                                'from_image_id' => $images[$h]->id,
                                'to_image_id' => $images[$h + 1]->id,
                            ]);
                        }
                    }
                }
            }
        }
    }
}

