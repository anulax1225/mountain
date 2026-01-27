<?php

/**
 * Migration Script: Migrate Local Files to S3 (RustFS)
 *
 * This script migrates all existing images and project photos from local public disk to S3.
 *
 * Usage with Tinker:
 * sail artisan tinker
 * >>> include 'storage/migrate-to-s3.php';
 *
 * Or run directly with:
 * sail artisan tinker < storage/migrate-to-s3.php
 */

use App\Models\Image;
use App\Models\Project;
use Illuminate\Support\Facades\Storage;

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "S3 Migration Script\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Configuration
$deleteLocal = false; // Set to true to delete local files after successful migration
$dryRun = false; // Set to true to simulate migration without actually copying files

if ($dryRun) {
    echo "⚠️  DRY RUN MODE - No files will be copied\n\n";
}

/**
 * Migrate images from public disk to S3
 */
function migrateImages($deleteLocal = false, $dryRun = false)
{
    $images = Image::whereNotNull('path')->get();

    if ($images->isEmpty()) {
        echo "ℹ️  No images found in database\n\n";
        return;
    }

    echo "Found {$images->count()} images to check\n";
    echo "Processing images...\n\n";

    $migrated = 0;
    $skipped = 0;
    $failed = 0;

    foreach ($images as $image) {
        try {
            // Check if file exists on public disk
            if (!Storage::disk('public')->exists($image->path)) {
                // Check if already on S3
                if (Storage::disk('s3')->exists($image->path)) {
                    echo "⏭️  Already on S3: {$image->name} ({$image->path})\n";
                    $skipped++;
                } else {
                    echo "⚠️  File not found: {$image->path}\n";
                    $failed++;
                }
                continue;
            }

            // File exists on public disk
            if ($dryRun) {
                echo "✓ Would migrate: {$image->name} ({$image->path})\n";
                $migrated++;
                continue;
            }

            // Copy file to S3
            $content = Storage::disk('public')->get($image->path);
            $result = Storage::disk('s3')->put($image->path, $content);

            if ($result) {
                echo "✓ Migrated: {$image->name} ({$image->path})\n";
                $migrated++;

                // Delete local file if requested
                if ($deleteLocal) {
                    Storage::disk('public')->delete($image->path);
                    echo "  ╰─ Deleted local file\n";
                }
            } else {
                echo "✗ Failed to migrate: {$image->name} ({$image->path})\n";
                $failed++;
            }

        } catch (Exception $e) {
            echo "✗ Error migrating {$image->name}: {$e->getMessage()}\n";
            $failed++;
        }
    }

    echo "\n";
    echo "Images Summary:\n";
    echo "  Migrated: {$migrated}\n";
    echo "  Skipped (already on S3): {$skipped}\n";
    echo "  Failed: {$failed}\n";
    echo "\n";
}

/**
 * Migrate project photos from public disk to S3
 */
function migrateProjectPhotos($deleteLocal = false, $dryRun = false)
{
    $projects = Project::whereNotNull('picture_path')->get();

    if ($projects->isEmpty()) {
        echo "ℹ️  No project photos found in database\n\n";
        return;
    }

    echo "Found {$projects->count()} project photos to check\n";
    echo "Processing project photos...\n\n";

    $migrated = 0;
    $skipped = 0;
    $failed = 0;

    foreach ($projects as $project) {
        try {
            // Check if file exists on public disk
            if (!Storage::disk('public')->exists($project->picture_path)) {
                // Check if already on S3
                if (Storage::disk('s3')->exists($project->picture_path)) {
                    echo "⏭️  Already on S3: {$project->name} ({$project->picture_path})\n";
                    $skipped++;
                } else {
                    echo "⚠️  File not found: {$project->picture_path}\n";
                    $failed++;
                }
                continue;
            }

            // File exists on public disk
            if ($dryRun) {
                echo "✓ Would migrate: {$project->name} ({$project->picture_path})\n";
                $migrated++;
                continue;
            }

            // Copy file to S3
            $content = Storage::disk('public')->get($project->picture_path);
            $result = Storage::disk('s3')->put($project->picture_path, $content, 'public');

            if ($result) {
                echo "✓ Migrated: {$project->name} ({$project->picture_path})\n";
                $migrated++;

                // Delete local file if requested
                if ($deleteLocal) {
                    Storage::disk('public')->delete($project->picture_path);
                    echo "  ╰─ Deleted local file\n";
                }
            } else {
                echo "✗ Failed to migrate: {$project->name} ({$project->picture_path})\n";
                $failed++;
            }

        } catch (Exception $e) {
            echo "✗ Error migrating {$project->name}: {$e->getMessage()}\n";
            $failed++;
        }
    }

    echo "\n";
    echo "Project Photos Summary:\n";
    echo "  Migrated: {$migrated}\n";
    echo "  Skipped (already on S3): {$skipped}\n";
    echo "  Failed: {$failed}\n";
    echo "\n";
}

// Run migrations
echo "Starting migration...\n\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "Migrating Images\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

migrateImages($deleteLocal, $dryRun);

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "Migrating Project Photos\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

migrateProjectPhotos($deleteLocal, $dryRun);

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "✓ Migration completed!\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

if (!$deleteLocal && !$dryRun) {
    echo "ℹ️  Local files were kept. To delete them after verifying the migration,\n";
    echo "   set \$deleteLocal = true in the script and run again.\n\n";
}

if ($dryRun) {
    echo "ℹ️  This was a dry run. Set \$dryRun = false to perform actual migration.\n\n";
}

echo "Next steps:\n";
echo "1. Verify files are accessible in RustFS console: http://localhost:9001\n";
echo "2. Test image loading in the application\n";
echo "3. If everything works, you can safely delete local files\n";
echo "4. For production, update .env with AWS S3 credentials\n\n";
