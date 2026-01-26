# Architecture Overview

This document provides a high-level overview of the Owlaround platform architecture.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Data Model](#data-model)
- [Request Flow](#request-flow)
- [File Structure](#file-structure)
- [Key Architectural Decisions](#key-architectural-decisions)

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Laravel** | 12 | PHP framework |
| **Inertia.js** | 2.0 | Server-driven SPA adapter |
| **Laravel Sanctum** | - | API token authentication |
| **Laravel Scribe** | - | API documentation generation |
| **MySQL** | 8.0+ | Database |
| **S3** | - | File storage (images, project photos) |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Vue.js** | 3 | UI framework (Composition API) |
| **Three.js** | 0.182 | 3D panorama rendering |
| **Tailwind CSS** | 4.1 | Utility-first CSS |
| **shadcn/vue** | - | UI component library (zinc theme) |
| **lucide-vue-next** | - | Icon library |
| **Vite** | 7.0 | Build tool |

### Development Tools

| Tool | Purpose |
|------|---------|
| Laravel Sail | Docker development environment |
| Laravel Telescope | Debug dashboard |
| Laravel Pint | PHP code style |
| ESLint + Prettier | JavaScript code style |

---

## Data Model

### Hierarchy

```
User
 └── Project (owned)
      ├── Scene (container)
      │    ├── Image (panoramic photo)
      │    │    ├── Hotspot (navigation link, from this image)
      │    │    └── Sticker (annotation)
      │    └── Hotspot (belongs to scene, links between images)
      └── AssignedUsers (collaborators with roles)
```

### Entity Relationships

```
┌─────────────┐         ┌─────────────┐
│    User     │────────▶│   Project   │
│             │ owns    │             │
└─────────────┘         └──────┬──────┘
      │                        │
      │ assigned to            │ has many
      ▼                        ▼
┌─────────────┐         ┌─────────────┐
│ ProjectUser │         │    Scene    │
│   (pivot)   │         │             │
└─────────────┘         └──────┬──────┘
                               │
                    ┌──────────┼──────────┐
                    │          │          │
                    ▼          ▼          ▼
             ┌──────────┐ ┌──────────┐ ┌──────────┐
             │  Image   │ │  Hotspot │ │ (future) │
             └────┬─────┘ └──────────┘ └──────────┘
                  │              ▲
        ┌─────────┼─────────┐    │
        │         │         │    │
        ▼         ▼         │    │
   ┌────────┐ ┌────────┐    │    │
   │Sticker │ │Hotspot │────┘────┘
   └────────┘ │(from)  │ links to
              └────────┘ another Image
```

### Key Models

| Model | Description | Key Fields |
|-------|-------------|------------|
| **User** | Platform user | email, password, roles |
| **Project** | Virtual tour container | name, slug, is_public, start_image_id |
| **Scene** | Location grouping | name, slug, project_id |
| **Image** | 360° panoramic photo | name, slug, path, size, scene_id |
| **Hotspot** | Navigation link | from_image_id, to_image_id, position (x,y,z), target_rotation (x,y,z) |
| **Sticker** | Image annotation | content, type (emoji/text), position, styling |

### UUID Slugs

All models use UUID slugs for routing instead of numeric IDs:

```
/projects/550e8400-e29b-41d4-a716-446655440000
/images/6ba7b810-9dad-11d1-80b4-00c04fd430c8
```

Benefits:
- No sequential ID exposure
- Globally unique identifiers
- Safe for public sharing

---

## Request Flow

### Inertia Page Request

```
Browser                    Laravel                     Vue
   │                          │                         │
   │  GET /dashboard          │                         │
   │─────────────────────────▶│                         │
   │                          │                         │
   │                          │  Route + Middleware     │
   │                          │  Controller::index()    │
   │                          │                         │
   │                          │  Inertia::render(       │
   │                          │    'dashboard/Index',   │
   │                          │    ['auth' => [...]]    │
   │                          │  )                      │
   │                          │                         │
   │  HTML + Inertia JSON     │                         │
   │◀─────────────────────────│                         │
   │                          │                         │
   │  Mount Vue App           │                         │
   │─────────────────────────────────────────────────▶│
   │                          │                         │
   │                          │  Page receives props    │
   │                          │  defineProps({ auth })  │
   │                          │                         │
```

### API Request (owl-sdk)

```
Vue Component              owl-sdk                   Laravel
      │                       │                         │
      │  owl.projects.get()   │                         │
      │──────────────────────▶│                         │
      │                       │                         │
      │                       │  GET /projects/{slug}   │
      │                       │  Authorization: Bearer  │
      │                       │──────────────────────▶│
      │                       │                         │
      │                       │                         │  Route Model Binding
      │                       │                         │  Policy Authorization
      │                       │                         │  Controller::show()
      │                       │                         │  ProjectResource
      │                       │                         │
      │                       │  JSON Response          │
      │                       │◀──────────────────────│
      │                       │                         │
      │  Resolved Promise     │                         │
      │◀──────────────────────│                         │
      │                       │                         │
```

### Authentication Flow

```
1. Login Request
   POST /login { email, password }
   → Session cookie + CSRF token

2. Inertia Requests
   GET /dashboard
   Cookie: session_id
   X-XSRF-TOKEN: ...

3. API Requests (owl-sdk)
   GET /api/projects
   Authorization: Bearer <token>
```

---

## File Structure

```
app/
├── Http/
│   ├── Controllers/           # Request handlers
│   │   ├── ProjectController.php
│   │   ├── SceneController.php
│   │   ├── ImageController.php
│   │   ├── HotspotController.php
│   │   └── StickerController.php
│   ├── Requests/              # Form validation
│   │   ├── StoreProjectRequest.php
│   │   └── UpdateProjectRequest.php
│   └── Resources/             # API response formatting
│       ├── ProjectResource.php
│       └── ImageResource.php
├── Models/                    # Eloquent models
│   ├── Project.php
│   ├── Scene.php
│   ├── Image.php
│   ├── Hotspot.php
│   └── Sticker.php
└── Policies/                  # Authorization
    ├── ProjectPolicy.php
    └── ImagePolicy.php

resources/js/
├── pages/                     # Inertia page components
│   ├── dashboard/
│   │   ├── Index.vue          # Projects list
│   │   ├── ProjectShow.vue    # Project detail
│   │   ├── SceneShow.vue      # Scene detail
│   │   └── Editor.vue         # 3D panorama editor
│   └── gallery/
│       ├── Index.vue          # Public gallery
│       └── Show.vue           # Public project viewer
├── components/
│   ├── ui/                    # shadcn/vue components
│   │   ├── button/
│   │   ├── dialog/
│   │   └── input/
│   ├── common/                # Reusable app components
│   │   ├── LoadingSpinner.vue
│   │   └── EmptyState.vue
│   ├── layout/                # Layout components
│   │   ├── Sidebar.vue
│   │   └── DashboardLayout.vue
│   └── dashboard/
│       ├── editor/            # 3D editor components
│       │   ├── EditorCanvas.vue
│       │   ├── EditorViewer.vue
│       │   └── HotspotPopover.vue
│       ├── project/           # Project components
│       └── scene/             # Scene components
├── composables/               # Vue 3 composables
│   ├── useApiError.js
│   ├── useConfirm.js
│   ├── useDateTime.js
│   ├── useForm.js
│   └── index.js               # Export all composables
├── lib/                       # Pure utilities
│   ├── editorConstants.js     # Magic numbers
│   ├── spatialMath.js         # 3D math functions
│   └── spriteFactory.js       # Three.js sprite creation
└── owl-sdk.js                 # API client

routes/
└── web.php                    # All routes (Inertia + API)

database/
├── migrations/                # Schema definitions
├── factories/                 # Test data factories
└── seeders/                   # Database seeders
```

---

## Key Architectural Decisions

### 1. No Pinia/Vuex

**Decision:** Use local refs + composables instead of global state management.

**Rationale:**
- Inertia provides page props from server
- owl-sdk handles API state
- Composables share logic without global state
- Props-down/events-up keeps data flow clear

**Pattern:**
```javascript
// Page manages state
const project = ref(null)
const loading = ref(true)

// Composables share logic
const { confirmDelete } = useConfirm()
const { handleError } = useApiError()

// Pass state down via props
<ChildComponent :project="project" @update="handleUpdate" />
```

### 2. UUID Slugs for Routing

**Decision:** Use UUID slugs instead of numeric IDs in URLs.

**Implementation:**
```php
// Model
public function getRouteKeyName() { return 'slug'; }

protected static function boot() {
    static::creating(fn($m) => $m->slug = Str::uuid());
}

// Route
Route::get('/projects/{project:slug}', ...);
```

**Benefits:**
- No ID enumeration attacks
- Safe for public sharing
- Globally unique

### 3. S3 for File Storage

**Decision:** Store all images on S3 (or S3-compatible storage).

**Implementation:**
```php
// Upload
$path = $file->store('images', 's3');

// Delete
Storage::disk('s3')->delete($path);
```

**Benefits:**
- Scalable storage
- CDN-ready
- Separate from application server

### 4. Cascade Deletion in Model Hooks

**Decision:** Handle cascade deletion in model `deleting` hooks.

**Implementation:**
```php
static::deleting(function ($project) {
    Storage::disk('s3')->delete($project->picture_path);
    $project->scenes()->each(fn($s) => $s->delete());
});
```

**Benefits:**
- Ensures file cleanup
- Triggers nested deletions
- Centralized in model

### 5. owl-sdk for API Communication

**Decision:** All API calls go through owl-sdk, never raw fetch/axios.

**Benefits:**
- Centralized auth token management
- Consistent error handling
- Retry logic
- Request/response interceptors

### 6. Composable-First Architecture

**Decision:** Extract reusable logic into composables.

**Categories:**
- Utility: `useDateTime`, `useFileSize`, `useImagePath`
- Interaction: `useConfirm`, `useDialog`, `useForm`
- Data: `useResource`, `useApiError`, `usePagination`
- 3D: `useThreeScene`, `usePanoramaLoader`

**Rule:** Never reimplement functionality that exists in a composable.

### 7. Centralized Constants

**Decision:** No magic numbers in code.

**Implementation:**
```javascript
// lib/editorConstants.js
export const SPHERE = {
  RADIUS: 500,
  SEGMENTS: 60,
}

export const SPRITE = {
  POSITION_SCALE: 0.95,
}

// Usage
import { SPHERE, SPRITE } from '@/lib/editorConstants'
point.multiplyScalar(SPRITE.POSITION_SCALE)
```

### 8. Permission Flags in API Responses

**Decision:** Include permission flags in API responses for frontend authorization.

**Implementation:**
```php
// Resource
'permissions' => [
    'can_edit' => $user->canAccessProject($this->resource, 'update'),
    'can_delete' => $user->isAdmin() || $this->user_id === $user->id,
]
```

**Frontend:**
```vue
<Button v-if="project.permissions?.can_edit">Edit</Button>
```

---

## Summary

The Owlaround architecture prioritizes:

1. **Server-driven UI** with Inertia.js
2. **Clean separation** between backend (Laravel) and frontend (Vue)
3. **Reusable patterns** via composables and utilities
4. **Explicit authorization** at controller and policy levels
5. **Type-safe communication** via owl-sdk
6. **Scalable storage** with S3
7. **Consistent conventions** documented in this guide
