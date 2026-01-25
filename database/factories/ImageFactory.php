<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\File;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Image>
 */
class ImageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'scene_id' => \App\Models\Scene::factory(),
            // Path and size will be set by withFile() state method
            'path' => null,
            'size' => 0,
        ];
    }

    /**
     * Add an actual file to the image.
     * This copies the source file to the storage and sets the path and size.
     *
     * @param string $sourceFilePath Absolute path to the source image file
     * @return static
     */
    public function withFile(string $sourceFilePath): static
    {
        return $this->state(function (array $attributes) use ($sourceFilePath) {
            if (!file_exists($sourceFilePath)) {
                throw new \InvalidArgumentException("Source file does not exist: {$sourceFilePath}");
            }

            // Generate a unique filename
            $extension = pathinfo($sourceFilePath, PATHINFO_EXTENSION);
            $filename = uniqid('panorama_') . '.' . $extension;

            // Store the file in the images directory on the public disk
            $storedPath = Storage::disk('public')->putFileAs('images', new File($sourceFilePath), $filename);

            // Get file size
            $fileSize = filesize($sourceFilePath);

            // Extract name from filename if not set
            $name = $attributes['name'] ?? pathinfo($sourceFilePath, PATHINFO_FILENAME);

            return [
                'path' => $storedPath,
                'size' => $fileSize,
                'name' => $name,
            ];
        });
    }

    /**
     * Create a fake image entry without an actual file.
     * Useful for testing when you don't need real image files.
     *
     * @return static
     */
    public function fake(): static
    {
        return $this->state(fn (array $attributes) => [
            'path' => 'images/fake_' . fake()->uuid() . '.jpg',
            'size' => fake()->numberBetween(1000000, 50000000), // 1MB to 50MB
        ]);
    }
}
