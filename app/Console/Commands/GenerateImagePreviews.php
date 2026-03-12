<?php

namespace App\Console\Commands;

use App\Jobs\GenerateImagePreview;
use App\Models\Image;
use Illuminate\Console\Command;

class GenerateImagePreviews extends Command
{
    protected $signature = 'images:generate-previews
                            {--force : Regenerate previews even if they already exist}';

    protected $description = 'Generate preview images for all existing images';

    public function handle(): int
    {
        $query = Image::query();

        if (! $this->option('force')) {
            $query->whereNull('preview_path');
        }

        $count = $query->count();

        if ($count === 0) {
            $this->info('No images need preview generation.');

            return Command::SUCCESS;
        }

        $this->info("Dispatching preview generation for {$count} image(s)...");

        $bar = $this->output->createProgressBar($count);
        $bar->start();

        $query->chunkById(100, function ($images) use ($bar) {
            foreach ($images as $image) {
                GenerateImagePreview::dispatch($image);
                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine(2);
        $this->info("Dispatched {$count} preview generation job(s) to the queue.");
        $this->info('Run the queue worker to process them.');

        return Command::SUCCESS;
    }
}
