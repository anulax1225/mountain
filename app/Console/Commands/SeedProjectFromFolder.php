<?php

namespace App\Console\Commands;

use App\Models\Image;
use App\Models\Project;
use App\Models\Scene;
use App\Models\Hotspot;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Http\File;
use Illuminate\Support\Facades\Storage;

class SeedProjectFromFolder extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'project:seed-from-folder
                            {folder : Path to the folder containing panoramic images}
                            {--user= : User email or ID to assign the project to (creates demo user if not specified)}
                            {--name= : Project name (auto-generated if not specified)}
                            {--description= : Project description}
                            {--scene= : Scene name (defaults to "Main Scene")}
                            {--public : Make the project public}
                            {--with-hotspots : Automatically create hotspots connecting all images in sequence}
                            {--hotspots-bidirectional : Make hotspots bidirectional (requires --with-hotspots)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a project and scene from a folder of panoramic images';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $folderPath = $this->argument('folder');

        // Validate folder exists
        if (!is_dir($folderPath)) {
            $this->error("Folder not found: {$folderPath}");
            return Command::FAILURE;
        }

        // Get all image files from folder
        $imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        $imageFiles = [];

        foreach (scandir($folderPath) as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }

            $filePath = $folderPath . DIRECTORY_SEPARATOR . $file;
            if (!is_file($filePath)) {
                continue;
            }

            $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
            if (in_array($extension, $imageExtensions)) {
                $imageFiles[] = $filePath;
            }
        }

        if (empty($imageFiles)) {
            $this->error("No image files found in folder: {$folderPath}");
            return Command::FAILURE;
        }

        $this->info("Found " . count($imageFiles) . " image(s) in folder.");

        // Get or create user
        $user = $this->getOrCreateUser();
        if (!$user) {
            return Command::FAILURE;
        }

        // Create project
        $projectName = $this->option('name') ?: 'Virtual Tour ' . now()->format('Y-m-d H:i');
        $project = Project::create([
            'user_id' => $user->id,
            'name' => $projectName,
            'description' => $this->option('description'),
            'is_public' => $this->option('public'),
        ]);

        $this->info("✓ Created project: {$project->name} (slug: {$project->slug})");

        // Create scene
        $sceneName = $this->option('scene') ?: 'Main Scene';
        $scene = Scene::create([
            'project_id' => $project->id,
            'name' => $sceneName,
        ]);

        $this->info("✓ Created scene: {$scene->name}");

        // Process images with progress bar
        $this->info("Processing images...");
        $progressBar = $this->output->createProgressBar(count($imageFiles));
        $progressBar->start();

        $createdImages = [];
        foreach ($imageFiles as $imageFile) {
            $image = $this->processImage($imageFile, $scene);
            $createdImages[] = $image;
            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);
        $this->info("✓ Processed " . count($createdImages) . " image(s)");

        // Set first image as start image
        if (!empty($createdImages)) {
            $project->update(['start_image_id' => $createdImages[0]->id]);
            $this->info("✓ Set start image: {$createdImages[0]->name}");
        }

        // Create hotspots if requested
        if ($this->option('with-hotspots') && count($createdImages) > 1) {
            $this->createHotspots($scene, $createdImages);
        }

        // Display summary
        $this->newLine();
        $this->info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        $this->info("✓ Project created successfully!");
        $this->info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        $this->table(
            ['Property', 'Value'],
            [
                ['Project Name', $project->name],
                ['Project Slug', $project->slug],
                ['Scene Name', $scene->name],
                ['Images', count($createdImages)],
                ['Owner', $user->email],
                ['Public', $project->is_public ? 'Yes' : 'No'],
            ]
        );

        $this->info("View project at: /projects/{$project->slug}");

        return Command::SUCCESS;
    }

    /**
     * Get or create the user for the project.
     *
     * @return User|null
     */
    protected function getOrCreateUser(): ?User
    {
        $userOption = $this->option('user');

        if ($userOption) {
            // Try to find by email first
            $user = User::where('email', $userOption)->first();

            // Try to find by ID if not found by email
            if (!$user && is_numeric($userOption)) {
                $user = User::find($userOption);
            }

            if (!$user) {
                $this->error("User not found: {$userOption}");
                return null;
            }

            $this->info("✓ Using existing user: {$user->email}");
            return $user;
        }

        // Create demo user
        $user = User::firstOrCreate(
            ['email' => 'demo@example.com'],
            [
                'name' => 'Demo User',
                'password' => bcrypt('password'),
            ]
        );

        $this->info("✓ Using demo user: {$user->email}");
        return $user;
    }

    /**
     * Process a single image file and create an Image record.
     *
     * @param string $filePath
     * @param Scene $scene
     * @return Image
     */
    protected function processImage(string $filePath, Scene $scene): Image
    {
        $filename = pathinfo($filePath, PATHINFO_FILENAME);
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);

        // Generate unique filename
        $storedFilename = uniqid('panorama_') . '.' . $extension;

        // Store file on s3
        $storedPath = Storage::disk('s3')->putFileAs('images', new File($filePath), $storedFilename);

        // Get file size
        $fileSize = filesize($filePath);

        // Create image record
        return Image::create([
            'scene_id' => $scene->id,
            'name' => $filename,
            'path' => $storedPath,
            'size' => $fileSize,
        ]);
    }

    /**
     * Create hotspots connecting images.
     *
     * @param Scene $scene
     * @param array $images
     * @return void
     */
    protected function createHotspots(Scene $scene, array $images): void
    {
        $bidirectional = $this->option('hotspots-bidirectional');
        $count = 0;

        $this->info("Creating hotspots...");

        // Create sequential hotspots (image 0 -> 1 -> 2 -> ... -> n)
        for ($i = 0; $i < count($images) - 1; $i++) {
            $fromImage = $images[$i];
            $toImage = $images[$i + 1];

            // Create forward hotspot
            $this->createHotspot($scene, $fromImage, $toImage);
            $count++;

            // Create backward hotspot if bidirectional
            if ($bidirectional) {
                $this->createHotspot($scene, $toImage, $fromImage);
                $count++;
            }
        }

        // Create a hotspot from last image back to first (circular navigation)
        $this->createHotspot($scene, $images[count($images) - 1], $images[0]);
        $count++;

        if ($bidirectional) {
            $this->createHotspot($scene, $images[0], $images[count($images) - 1]);
            $count++;
        }

        $this->info("✓ Created {$count} hotspot(s)");
    }

    /**
     * Create a single hotspot between two images.
     *
     * @param Scene $scene
     * @param Image $fromImage
     * @param Image $toImage
     * @return Hotspot
     */
    protected function createHotspot(Scene $scene, Image $fromImage, Image $toImage): Hotspot
    {
        // Generate random position on the sphere
        $radius = 500;
        $positionScale = 0.95;

        // Place hotspot in front of camera (slightly to the right)
        $azimuthal = rand(-30, 30) * (M_PI / 180); // -30° to +30°
        $polar = M_PI / 2; // Horizon level

        // Convert to Cartesian
        $x = $radius * sin($polar) * cos($azimuthal);
        $y = $radius * cos($polar);
        $z = $radius * sin($polar) * sin($azimuthal);

        // Scale position
        $x *= $positionScale;
        $y *= $positionScale;
        $z *= $positionScale;

        // Random target rotation (roughly forward)
        $targetRotationX = (rand(-30, 30) * M_PI) / 180;
        $targetRotationY = (rand(-15, 15) * M_PI) / 180;

        return Hotspot::create([
            'scene_id' => $scene->id,
            'from_image_id' => $fromImage->id,
            'to_image_id' => $toImage->id,
            'position_x' => $x,
            'position_y' => $y,
            'position_z' => $z,
            'target_rotation_x' => $targetRotationX,
            'target_rotation_y' => $targetRotationY,
            'target_rotation_z' => 0,
        ]);
    }
}

