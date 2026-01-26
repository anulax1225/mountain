# Backend Standards (Laravel)

This document defines the standard patterns for Laravel backend development in the Owlaround platform.

## Table of Contents

- [Controllers](#controllers)
- [Models](#models)
- [Policies](#policies)
- [Form Requests](#form-requests)
- [Routes](#routes)
- [API Resources](#api-resources)

---

## Controllers

### Structure

All controllers extend the base `Controller` class and follow RESTful conventions:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ProjectController extends Controller
{
    // List resources
    public function index(Request $request): AnonymousResourceCollection
    {
        // Implementation
    }

    // Create resource
    public function store(StoreProjectRequest $request): ProjectResource
    {
        // Implementation
    }

    // Show single resource
    public function show(Project $project): ProjectResource
    {
        // Implementation
    }

    // Update resource
    public function update(UpdateProjectRequest $request, Project $project): ProjectResource
    {
        // Implementation
    }

    // Delete resource
    public function destroy(Project $project): Response
    {
        // Implementation
    }
}
```

### Return Types

| Method | Return Type | HTTP Status |
|--------|-------------|-------------|
| `index()` | `AnonymousResourceCollection` | 200 |
| `store()` | `ResourceClass` | 201 |
| `show()` | `ResourceClass` | 200 |
| `update()` | `ResourceClass` | 200 |
| `destroy()` | `Response` (noContent) | 204 |
| `download()` | `StreamedResponse` | 200 |

### Authorization Pattern

Authorization happens at TWO levels:

**1. Resource-level authorization:**

```php
public function show(Project $project): ProjectResource
{
    $this->authorize('view', $project);

    return new ProjectResource($project);
}

public function store(StoreProjectRequest $request): ProjectResource
{
    $this->authorize('create', Project::class);

    // Create logic...
}
```

**2. Nested resource authorization (check full hierarchy):**

```php
public function destroy(Image $image): Response
{
    // Check parent project access
    $this->authorize('view', $image->scene->project);

    // Check parent scene access
    $this->authorize('view', $image->scene);

    // Check resource-specific permission
    $this->authorize('delete', $image);

    // Delete logic...
    $image->delete();

    return response()->noContent();
}
```

### Validation Pattern

All validation is delegated to Form Requests:

```php
// Validation happens automatically in the FormRequest
public function store(StoreImageRequest $request, Scene $scene): ImageResource
{
    // $request->validated() contains only validated data
    $file = $request->file('image');
    $path = $file->store('images', 's3');

    $image = $scene->images()->create([
        'name' => $request->input('name'),
        'path' => $path,
        'size' => $file->getSize(),
    ]);

    return new ImageResource($image);
}
```

### File Upload Pattern

```php
public function update(UpdateProjectRequest $request, Project $project): ProjectResource
{
    $this->authorize('update', $project);

    $data = $request->validated();

    // Handle file upload
    if ($request->hasFile('photo')) {
        // Delete old file if exists
        if ($project->picture_path && Storage::disk('s3')->exists($project->picture_path)) {
            Storage::disk('s3')->delete($project->picture_path);
        }

        // Store new file
        $path = $request->file('photo')->store('project-photos', 's3');
        $data['picture_path'] = $path;

        // Remove file from data array (not a model attribute)
        unset($data['photo']);
    }

    $project->update($data);

    return new ProjectResource($project);
}
```

### Eager Loading Pattern

Always eager load relationships to avoid N+1 queries:

```php
public function index(Scene $scene): AnonymousResourceCollection
{
    $images = $scene->images()
        ->with(['hotspotsFrom.toImage', 'hotspotsTo.fromImage', 'stickers'])
        ->paginate(15);

    return ImageResource::collection($images);
}

public function show(Project $project): ProjectResource
{
    $this->authorize('view', $project);

    // Load all needed relationships
    $project->load(['scenes.images', 'startImage', 'assignedUsers']);

    return new ProjectResource($project);
}
```

### Role-Based Filtering

```php
public function index(Request $request): AnonymousResourceCollection
{
    $user = $request->user();

    if ($user->isAdmin()) {
        // Admins see all resources
        $projects = Project::with('scenes')->paginate(15);
    } else {
        // Users see own + assigned resources
        $ownProjectIds = $user->projects()->pluck('id');
        $assignedProjectIds = $user->projectAccess()->pluck('projects.id');
        $allProjectIds = $ownProjectIds->merge($assignedProjectIds)->unique();

        $projects = Project::whereIn('id', $allProjectIds)
            ->with('scenes')
            ->paginate(15);
    }

    return ProjectResource::collection($projects);
}
```

---

## Models

### UUID Slug Generation

All models use UUID slugs for routing instead of numeric IDs:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Project extends Model
{
    protected $fillable = [
        'slug',
        'user_id',
        'name',
        'description',
        'picture_path',
        'is_public',
        'start_image_id',
    ];

    protected static function boot()
    {
        parent::boot();

        // Auto-generate UUID on creation
        static::creating(function ($project) {
            if (empty($project->slug)) {
                $project->slug = (string) Str::uuid();
            }
        });
    }

    // Enable route model binding on slug
    public function getRouteKeyName()
    {
        return 'slug';
    }
}
```

### Relationship Definitions

**Ownership (BelongsTo):**

```php
public function user(): BelongsTo
{
    return $this->belongsTo(User::class);
}

public function scene(): BelongsTo
{
    return $this->belongsTo(Scene::class);
}
```

**Collections (HasMany):**

```php
public function scenes(): HasMany
{
    return $this->hasMany(Scene::class);
}

public function images(): HasMany
{
    return $this->hasMany(Image::class);
}
```

**Directional Relationships (for Hotspots):**

```php
// In Image model
public function hotspotsFrom(): HasMany
{
    return $this->hasMany(Hotspot::class, 'from_image_id')
        ->with('toImage');  // Eager load to avoid N+1
}

public function hotspotsTo(): HasMany
{
    return $this->hasMany(Hotspot::class, 'to_image_id')
        ->with('fromImage');
}

// In Hotspot model
public function fromImage(): BelongsTo
{
    return $this->belongsTo(Image::class, 'from_image_id');
}

public function toImage(): BelongsTo
{
    return $this->belongsTo(Image::class, 'to_image_id');
}
```

**Many-to-Many with Pivot:**

```php
public function assignedUsers(): BelongsToMany
{
    return $this->belongsToMany(User::class, 'project_user')
        ->withPivot('role_id')
        ->withTimestamps();
}
```

### Cascade Deletion

Handle cascade deletions in the `deleting` hook:

```php
protected static function boot()
{
    parent::boot();

    static::creating(function ($project) {
        if (empty($project->slug)) {
            $project->slug = (string) Str::uuid();
        }
    });

    static::deleting(function ($project) {
        // Delete associated files
        if ($project->picture_path && Storage::disk('s3')->exists($project->picture_path)) {
            Storage::disk('s3')->delete($project->picture_path);
        }

        // Cascade delete related records
        // This triggers their own deleting hooks
        $project->scenes()->each(function ($scene) {
            $scene->delete();
        });
    });
}
```

### Attribute Casting

Define type-safe attributes:

```php
protected $casts = [
    'is_public' => 'boolean',
    'position_x' => 'float',
    'position_y' => 'float',
    'position_z' => 'float',
    'created_at' => 'datetime',
    'updated_at' => 'datetime',
];

// Or using the casts method (Laravel 11+)
protected function casts(): array
{
    return [
        'is_public' => 'boolean',
    ];
}
```

---

## Policies

### Authorization Hierarchy

Policies follow this permission hierarchy:

1. **Admin** - Full access to everything
2. **Owner** - Full access to owned resources
3. **Assigned Users** - Access based on project role
4. **Public** - Read-only access to public resources

```php
<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    /**
     * View - Most permissive
     * Public projects, admins, owners, and assigned users can view
     */
    public function view(User $user, Project $project): bool
    {
        // Public projects are viewable by anyone
        if ($project->is_public) {
            return true;
        }

        // Admins can view everything
        if ($user->isAdmin()) {
            return true;
        }

        // Owners can view their projects
        if ($user->id === $project->user_id) {
            return true;
        }

        // Check project-level access
        return $user->canAccessProject($project, 'view');
    }

    /**
     * Create - Restricted to admins
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Update - Owners and assigned project owners
     */
    public function update(User $user, Project $project): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->id === $project->user_id) {
            return true;
        }

        return $user->canAccessProject($project, 'update');
    }

    /**
     * Delete - Only creator and admins (not collaborators)
     */
    public function delete(User $user, Project $project): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->id === $project->user_id;
    }

    /**
     * Custom action - Make public
     */
    public function makePublic(User $user, Project $project): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->id === $project->user_id;
    }
}
```

### Nested Resource Policies

For nested resources, delegate to parent:

```php
class ImagePolicy
{
    public function view(User $user, Image $image): bool
    {
        $project = $image->scene->project;

        // Reuse project view logic
        if ($project->is_public) {
            return true;
        }

        if ($user->isAdmin()) {
            return true;
        }

        if ($user->id === $project->user_id) {
            return true;
        }

        return $user->canAccessProject($project, 'view');
    }

    public function update(User $user, Image $image): bool
    {
        $project = $image->scene->project;

        if ($user->isAdmin()) {
            return true;
        }

        if ($user->id === $project->user_id) {
            return true;
        }

        return $user->canAccessProject($project, 'update');
    }
}
```

---

## Form Requests

### Basic Structure

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    /**
     * Authorization check
     * Usually return true and let controller handle policy
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validation rules
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpeg,jpg,png,gif,webp|max:5120',
        ];
    }
}
```

### Update Requests (Partial Updates)

Update requests make fields optional:

```php
class UpdateHotspotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // No 'required' - all fields optional for PATCH
            'from_image_id' => 'exists:images,id',
            'to_image_id' => 'exists:images,id',
            'position_x' => 'numeric',
            'position_y' => 'numeric',
            'position_z' => 'numeric',
            'target_rotation_x' => 'nullable|numeric',
            'target_rotation_y' => 'nullable|numeric',
            'target_rotation_z' => 'nullable|numeric',
            'custom_image' => 'nullable|string|max:255',
            'custom_color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ];
    }
}
```

### Custom Validation Messages (French)

```php
public function messages(): array
{
    return [
        'name.required' => 'Le nom est obligatoire.',
        'name.max' => 'Le nom ne peut pas dépasser :max caractères.',
        'custom_color.regex' => 'La couleur doit être au format hexadécimal (#RRGGBB).',
        'image.max' => 'L\'image ne peut pas dépasser :max Ko.',
    ];
}
```

### Authorization in FormRequest

For cases where authorization is simpler in the request:

```php
class StoreImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Check if user can create images in this scene
        $scene = $this->route('scene');
        return $this->user()->can('update', $scene->project);
    }

    public function rules(): array
    {
        return [
            'image' => ['required', 'image', 'max:20480'],
            'name' => ['nullable', 'string', 'max:255'],
        ];
    }
}
```

---

## Routes

### Nested Resource Structure

Routes follow the data hierarchy:

```php
// routes/web.php

Route::middleware('auth')->group(function () {

    // === PROJECTS (top-level) ===
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects/{project:slug}', [ProjectController::class, 'show']);
    Route::put('/projects/{project:slug}', [ProjectController::class, 'update']);
    Route::patch('/projects/{project:slug}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project:slug}', [ProjectController::class, 'destroy']);

    // Custom actions
    Route::post('/projects/{project:slug}/make-public', [ProjectController::class, 'makePublic']);
    Route::get('/projects/{project:slug}/images', [ProjectController::class, 'images']);

    // === SCENES (nested under projects) ===
    Route::get('/projects/{project:slug}/scenes', [SceneController::class, 'index']);
    Route::post('/projects/{project:slug}/scenes', [SceneController::class, 'store']);

    // Scene operations use scene slug directly
    Route::get('/scenes/{scene:slug}', [SceneController::class, 'show']);
    Route::put('/scenes/{scene:slug}', [SceneController::class, 'update']);
    Route::patch('/scenes/{scene:slug}', [SceneController::class, 'update']);
    Route::delete('/scenes/{scene:slug}', [SceneController::class, 'destroy']);

    // === IMAGES (nested under scenes) ===
    Route::get('/scenes/{scene:slug}/images', [ImageController::class, 'index']);
    Route::post('/scenes/{scene:slug}/images', [ImageController::class, 'store']);

    Route::get('/images/{image:slug}', [ImageController::class, 'show']);
    Route::post('/images/{image:slug}', [ImageController::class, 'update']);  // POST for multipart
    Route::delete('/images/{image:slug}', [ImageController::class, 'destroy']);
    Route::get('/images/{image:slug}/download', [ImageController::class, 'download']);

    // === HOTSPOTS (nested under scenes) ===
    Route::get('/scenes/{scene:slug}/hotspots', [HotspotController::class, 'index']);
    Route::post('/scenes/{scene:slug}/hotspots', [HotspotController::class, 'store']);

    Route::get('/hotspots/{hotspot:slug}', [HotspotController::class, 'show']);
    Route::put('/hotspots/{hotspot:slug}', [HotspotController::class, 'update']);
    Route::patch('/hotspots/{hotspot:slug}', [HotspotController::class, 'update']);
    Route::delete('/hotspots/{hotspot:slug}', [HotspotController::class, 'destroy']);

    // === STICKERS (nested under images) ===
    Route::get('/images/{image:slug}/stickers', [StickerController::class, 'index']);
    Route::post('/images/{image:slug}/stickers', [StickerController::class, 'store']);

    Route::get('/stickers/{sticker:slug}', [StickerController::class, 'show']);
    Route::put('/stickers/{sticker:slug}', [StickerController::class, 'update']);
    Route::delete('/stickers/{sticker:slug}', [StickerController::class, 'destroy']);
});
```

### Route Model Binding with Slugs

Routes use `{model:slug}` syntax for slug-based binding:

```php
// Route definition
Route::get('/projects/{project:slug}', [ProjectController::class, 'show']);

// Controller receives resolved model
public function show(Project $project): ProjectResource
{
    // $project is already loaded from database using the slug
    $this->authorize('view', $project);
    return new ProjectResource($project);
}
```

### Special Route Patterns

**File uploads (use POST instead of PUT/PATCH):**

```php
// Multipart form data requires POST
Route::post('/images/{image:slug}', [ImageController::class, 'update']);
```

**Public routes (outside auth middleware):**

```php
// Public gallery
Route::get('/gallery', [GalleryController::class, 'index']);
Route::get('/gallery/{project:slug}', [GalleryController::class, 'show']);

// Public contact form
Route::post('/contact', [ContactRequestController::class, 'store']);

// Public analytics
Route::post('/analytics/track', [AnalyticsController::class, 'track']);
```

---

## API Resources

### Basic Resource Structure

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            // Basic attributes
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'description' => $this->description,
            'picture_path' => $this->picture_path,
            'is_public' => $this->is_public ?? false,
            'start_image_id' => $this->start_image_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Conditional relationships (only if loaded)
            'user' => $this->whenLoaded('user'),
            'scenes' => SceneResource::collection($this->whenLoaded('scenes')),
            'start_image' => new ImageResource($this->whenLoaded('startImage')),

            // Permission flags for frontend
            'permissions' => $this->when($user !== null, function () use ($user) {
                return [
                    'can_edit' => $user->canAccessProject($this->resource, 'update'),
                    'can_delete' => $user->isAdmin() || $this->user_id === $user->id,
                    'can_manage_users' => $user->isProjectOwner($this->resource),
                    'can_manage_settings' => $user->isAdmin() || $this->user_id === $user->id,
                    'is_owner' => $this->user_id === $user->id,
                ];
            }),
        ];
    }
}
```

### Conditional Relationship Loading

Use `whenLoaded()` to only include relationships when eager-loaded:

```php
// In Resource
'scenes' => SceneResource::collection($this->whenLoaded('scenes')),
'hotspots_from' => HotspotResource::collection($this->whenLoaded('hotspotsFrom')),

// In Controller - load what you need
$project->load(['scenes.images', 'startImage']);
```

### Nested Resources

```php
class ImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'path' => $this->path,
            'size' => $this->size,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Nested resources
            'hotspots_from' => HotspotResource::collection($this->whenLoaded('hotspotsFrom')),
            'hotspots_to' => HotspotResource::collection($this->whenLoaded('hotspotsTo')),
            'stickers' => StickerResource::collection($this->whenLoaded('stickers')),
        ];
    }
}
```

### Permission Flags

Include permission flags so frontend can show/hide UI elements:

```php
'permissions' => $this->when($user !== null, function () use ($user) {
    return [
        'can_edit' => $user->canAccessProject($this->resource, 'update'),
        'can_delete' => $user->isAdmin() || $this->user_id === $user->id,
    ];
}),
```

Frontend usage:

```vue
<Button v-if="project.permissions?.can_edit" @click="editProject">
  Edit
</Button>
```

---

## Quick Reference

### Controller Method Checklist

- [ ] Define explicit return type
- [ ] Call `$this->authorize()` with appropriate policy
- [ ] For nested resources, check parent authorization
- [ ] Use FormRequest for validation
- [ ] Eager load relationships with `->with()`
- [ ] Return appropriate Resource class

### Model Checklist

- [ ] Define `$fillable` array
- [ ] Add UUID generation in `boot()` creating hook
- [ ] Define `getRouteKeyName()` returning `'slug'`
- [ ] Define all relationships with return types
- [ ] Add cascade deletion in `boot()` deleting hook
- [ ] Define `$casts` for type-safe attributes

### Policy Checklist

- [ ] Check admin first (`$user->isAdmin()`)
- [ ] Check owner second (`$user->id === $model->user_id`)
- [ ] Check assigned access (`$user->canAccessProject()`)
- [ ] Check public access last (if applicable)

### FormRequest Checklist

- [ ] Return `true` from `authorize()` (let controller handle policy)
- [ ] Define all validation rules in `rules()`
- [ ] Use French messages in `messages()` if needed
- [ ] Update requests: remove `required` from rules
