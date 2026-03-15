<?php

namespace App\Jobs;

use App\Models\Image;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Imagick\Driver;
use Intervention\Image\Exceptions\DecoderException;
use Intervention\Image\ImageManager;

class GenerateImagePreview implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 30;

    public function __construct(
        public Image $image,
    ) {}

    public function handle(): void
    {
        $disk = Storage::disk('s3');

        if (! $disk->exists($this->image->path)) {
            return;
        }

        $scaleFactor = config('images.preview.scale_factor', 0.25);
        $quality = config('images.preview.quality', 70);

        $tempInput = tempnam(sys_get_temp_dir(), 'preview_in_');
        $tempOutput = tempnam(sys_get_temp_dir(), 'preview_out_').'.jpg';

        try {
            file_put_contents($tempInput, $disk->get($this->image->path));

            $manager = new ImageManager(new Driver);
            $processed = $manager->read($tempInput);

            $originalWidth = $processed->width();
            $originalHeight = $processed->height();
            $targetWidth = (int) round($originalWidth * $scaleFactor);
            $targetHeight = (int) round($originalHeight * $scaleFactor);

            $processed->resize($targetWidth, $targetHeight);
            $processed->toJpeg($quality)->save($tempOutput);
            unset($processed);

            $previewPath = 'previews/'.Str::uuid().'.jpg';

            if ($this->image->preview_path && $disk->exists($this->image->preview_path)) {
                $disk->delete($this->image->preview_path);
            }

            $disk->put($previewPath, file_get_contents($tempOutput));
            $this->image->update(['preview_path' => $previewPath]);
        } catch (DecoderException $e) {
            Log::warning("Failed to generate preview for image {$this->image->id}: {$e->getMessage()}");
        } finally {
            @unlink($tempInput);
            @unlink($tempOutput);
        }
    }
}
