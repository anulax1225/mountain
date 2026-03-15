<?php

use App\Jobs\GenerateImagePreview;
use App\Models\Image;
use App\Models\Project;
use App\Models\Scene;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Storage;

// ===========================================================================
// job dispatch
// ===========================================================================

it('dispatches preview generation job when image is stored', function () {
    Storage::fake('s3');
    Bus::fake([GenerateImagePreview::class]);

    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $key = 'uploads/test-panorama.jpg';
    Storage::disk('s3')->put($key, 'fake-image-content');

    $this->actingAs($admin)
        ->postJson("/scenes/{$scene->slug}/images", [
            'key' => $key,
            'name' => 'Test Panorama',
            'size' => 1024000,
            'mime' => 'image/jpeg',
        ]);

    Bus::assertDispatched(GenerateImagePreview::class);
});

it('dispatches preview generation job when image file is replaced', function () {
    Storage::fake('s3');
    Bus::fake([GenerateImagePreview::class]);

    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $this->actingAs($admin)
        ->postJson("/images/{$image->slug}", [
            'image' => \Illuminate\Http\UploadedFile::fake()->image('new-panorama.jpg', 800, 400),
        ]);

    Bus::assertDispatched(GenerateImagePreview::class);
});

it('does not dispatch preview job when only name is updated', function () {
    Bus::fake([GenerateImagePreview::class]);

    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $this->actingAs($admin)
        ->postJson("/images/{$image->slug}", [
            'name' => 'New Name',
        ]);

    Bus::assertNotDispatched(GenerateImagePreview::class);
});

// ===========================================================================
// job execution
// ===========================================================================

it('generates preview and updates image record', function () {
    Storage::fake('s3');

    $scene = Scene::factory()->create();
    $image = Image::factory()->create(['scene_id' => $scene->id, 'path' => 'images/test.jpg']);

    // Create a real JPEG in S3 using GD
    $gd = imagecreatetruecolor(800, 400);
    ob_start();
    imagejpeg($gd);
    $jpegContent = ob_get_clean();
    imagedestroy($gd);
    Storage::disk('s3')->put('images/test.jpg', $jpegContent);

    $job = new GenerateImagePreview($image);
    $job->handle();

    $image->refresh();

    expect($image->preview_path)->toMatch('/^previews\/[0-9a-f\-]{36}\.jpg$/');
    Storage::disk('s3')->assertExists($image->preview_path);
});

it('skips gracefully when source image does not exist on S3', function () {
    Storage::fake('s3');

    $scene = Scene::factory()->create();
    $image = Image::factory()->create(['scene_id' => $scene->id, 'path' => 'images/missing.jpg']);

    $job = new GenerateImagePreview($image);
    $job->handle();

    $image->refresh();

    expect($image->preview_path)->toBeNull();
});

it('deletes old preview when regenerating', function () {
    Storage::fake('s3');

    $scene = Scene::factory()->create();
    $image = Image::factory()->create([
        'scene_id' => $scene->id,
        'path' => 'images/test.jpg',
        'preview_path' => 'previews/old-preview.jpg',
    ]);

    Storage::disk('s3')->put('previews/old-preview.jpg', 'old-preview-content');

    // Create a real JPEG in S3
    $gd = imagecreatetruecolor(800, 400);
    ob_start();
    imagejpeg($gd);
    $jpegContent = ob_get_clean();
    imagedestroy($gd);
    Storage::disk('s3')->put('images/test.jpg', $jpegContent);

    $job = new GenerateImagePreview($image);
    $job->handle();

    $image->refresh();

    Storage::disk('s3')->assertMissing('previews/old-preview.jpg');
    expect($image->preview_path)->toMatch('/^previews\/[0-9a-f\-]{36}\.jpg$/');
    Storage::disk('s3')->assertExists($image->preview_path);
});

// ===========================================================================
// preview endpoint
// ===========================================================================

it('serves preview for public project without auth', function () {
    Storage::fake('s3');

    $project = Project::factory()->public()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->create([
        'scene_id' => $scene->id,
        'path' => 'images/test.jpg',
        'preview_path' => 'previews/test.jpg',
    ]);

    Storage::disk('s3')->put('previews/test.jpg', 'preview-content');

    $response = $this->get("/images/{$image->slug}/preview");

    $response->assertOk();
    $response->assertHeader('Content-Type', 'image/jpeg');
    $response->assertHeader('Cache-Control', 'immutable, max-age=31536000, public');
});

it('falls back to full image when no preview exists', function () {
    Storage::fake('s3');

    $project = Project::factory()->public()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->create([
        'scene_id' => $scene->id,
        'path' => 'images/test.jpg',
        'preview_path' => null,
    ]);

    Storage::disk('s3')->put('images/test.jpg', 'full-image-content');

    $response = $this->get("/images/{$image->slug}/preview");

    $response->assertOk();
    $response->assertHeader('Content-Type', 'image/jpeg');
});

it('returns 403 for preview on private project without access', function () {
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $client = createClient();

    $response = $this->actingAs($client)
        ->get("/images/{$image->slug}/preview");

    $response->assertForbidden();
});

it('includes preview_path in image resource response', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create([
        'scene_id' => $scene->id,
        'preview_path' => 'previews/test.jpg',
    ]);

    $response = $this->actingAs($admin)
        ->getJson("/images/{$image->slug}");

    $response->assertSuccessful()
        ->assertJsonPath('preview_path', 'previews/test.jpg');
});

// ===========================================================================
// cleanup
// ===========================================================================

it('deletes preview file when image is deleted', function () {
    Storage::fake('s3');

    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->create([
        'scene_id' => $scene->id,
        'path' => 'images/test.jpg',
        'preview_path' => 'previews/test.jpg',
    ]);

    Storage::disk('s3')->put('images/test.jpg', 'image-content');
    Storage::disk('s3')->put('previews/test.jpg', 'preview-content');

    $this->actingAs($admin)
        ->deleteJson("/images/{$image->slug}")
        ->assertNoContent();

    Storage::disk('s3')->assertMissing('previews/test.jpg');
    Storage::disk('s3')->assertMissing('images/test.jpg');
});
