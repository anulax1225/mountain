<?php

namespace App\Console\Commands;

use App\Models\Image;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MigrateImageFilenames extends Command
{
    protected $signature = 'images:migrate-filenames
                            {--dry-run : Show what would be changed without making changes}';

    protected $description = 'Migrate existing image files to UUID-based filenames and populate original_name';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $disk = Storage::disk('s3');

        $count = Image::count();

        if ($count === 0) {
            $this->info('No images to migrate.');

            return Command::SUCCESS;
        }

        $this->info(($dryRun ? '[DRY RUN] ' : '')."Migrating {$count} image(s) to UUID filenames...");

        $bar = $this->output->createProgressBar($count);
        $bar->start();

        $migrated = 0;
        $skipped = 0;
        $errors = 0;

        Image::chunkById(100, function ($images) use ($disk, $dryRun, $bar, &$migrated, &$skipped, &$errors) {
            foreach ($images as $image) {
                try {
                    $this->migrateImage($image, $disk, $dryRun, $migrated, $skipped);
                } catch (\Throwable $e) {
                    $errors++;
                    $this->newLine();
                    $this->error("Failed to migrate image {$image->id}: {$e->getMessage()}");
                }

                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine(2);
        $this->info("Migrated: {$migrated}, Skipped: {$skipped}, Errors: {$errors}");

        return $errors > 0 ? Command::FAILURE : Command::SUCCESS;
    }

    private function migrateImage(Image $image, $disk, bool $dryRun, int &$migrated, int &$skipped): void
    {
        $currentPath = $image->path;
        $currentFilename = basename($currentPath);

        // Skip if already UUID-based (UUID format: 8-4-4-4-12 hex chars)
        $filenameWithoutExt = pathinfo($currentFilename, PATHINFO_FILENAME);
        if (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $filenameWithoutExt)) {
            // Already UUID-based, just populate original_name if missing
            if (! $image->original_name) {
                if (! $dryRun) {
                    $image->update(['original_name' => $currentFilename]);
                }
            }
            $skipped++;

            return;
        }

        $updateData = [];

        // Set original_name from current filename
        $updateData['original_name'] = $currentFilename;

        // Rename image file
        $extension = pathinfo($currentFilename, PATHINFO_EXTENSION) ?: 'jpg';
        $newPath = 'images/'.Str::uuid().'.'.$extension;

        if (! $dryRun) {
            if ($disk->exists($currentPath)) {
                $disk->copy($currentPath, $newPath);
                $disk->delete($currentPath);
            }
            $updateData['path'] = $newPath;
        }

        // Rename preview file
        if ($image->preview_path) {
            $newPreviewPath = 'previews/'.Str::uuid().'.jpg';

            if (! $dryRun) {
                if ($disk->exists($image->preview_path)) {
                    $disk->copy($image->preview_path, $newPreviewPath);
                    $disk->delete($image->preview_path);
                }
                $updateData['preview_path'] = $newPreviewPath;
            }
        }

        if (! $dryRun) {
            $image->update($updateData);
        }

        $migrated++;
    }
}
