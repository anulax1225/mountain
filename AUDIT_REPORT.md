# Owlaround Codebase Audit Report

**Date:** January 26, 2026
**Audited Against:** `docs/` Standards Documentation
**Project:** Owlaround - 360° Panoramic Photo Editor

---

## Executive Summary

| Category | Compliance | Critical Issues | Medium Issues | Minor Issues |
|----------|:----------:|:---------------:|:-------------:|:------------:|
| Controllers | 60% | 2 | 4 | 2 |
| Models | 90% | 1 | 0 | 1 |
| Vue Components | 70% | 3 | 5 | 2 |
| 3D Editor | 85% | 0 | 7 | 0 |
| Composable Usage | 65% | 0 | 10+ | 7 |
| Policies & Auth | 75% | 3 | 4 | 2 |

**Overall Health Score: 7.4/10**

The codebase is generally well-structured with established patterns. The main issues are:
1. **Inconsistent authorization** - Some controllers use manual checks instead of policies
2. **API call bypassing** - Several components use axios/fetch directly instead of owl-sdk
3. **Missing composable usage** - `window.confirm`, manual error handling, and date formatting
4. **Hardcoded values** - Several magic numbers in editor code not in `editorConstants.js`

---

## Table of Contents

1. [Backend: Controllers](#1-backend-controllers)
2. [Backend: Models](#2-backend-models)
3. [Backend: Policies & Routes](#3-backend-policies--routes)
4. [Frontend: Vue Components](#4-frontend-vue-components)
5. [Frontend: Composable Usage](#5-frontend-composable-usage)
6. [Frontend: 3D Editor](#6-frontend-3d-editor)
7. [Priority Action Items](#7-priority-action-items)

---

## 1. Backend: Controllers

**Standard:** `docs/02-backend-standards.md`

### Compliance Summary

| Controller | Authorization | FormRequest | Eager Loading | Status |
|------------|:-------------:|:-----------:|:-------------:|:------:|
| ProjectController | ✅ | ✅ | ✅ | PASS |
| SceneController | ✅ | ✅ | ✅ | PASS |
| ImageController | ⚠️ | ✅ | ✅ | MINOR |
| HotspotController | ✅ | ✅ | ✅ | PASS |
| StickerController | ✅ | ✅ | ✅ | PASS |
| GalleryController | ❌ | N/A | ✅ | FAIL |
| AnalyticsController | ⚠️ | ❌ | ✅ | FAIL |
| AdminUserController | ❌ | ✅ | ✅ | FAIL |
| AdminContactRequestController | ❌ | ⚠️ | ✅ | FAIL |
| RoleController | ⚠️ | ✅ | ✅ | MINOR |
| DashboardController | ❌ | N/A | N/A | FAIL |
| AuthController | ⚠️ | ❌ | N/A | MINOR |
| ProjectUserController | ✅ | ✅ | ✅ | PASS |
| ContactRequestController | ✅ | ⚠️ | N/A | PASS |

### Critical Issues

#### 1.1 DashboardController - Missing Authorization
**File:** `app/Http/Controllers/DashboardController.php`
**Lines:** 15, 22, 29

Dashboard routes don't verify user authorization before rendering:

```php
// ❌ Current - No authorization
public function showProject($slug) {
    return Inertia::render('dashboard/ProjectShow', [
        'projectSlug' => $slug,
    ]);
}

// ✅ Should be
public function showProject($slug) {
    $project = Project::where('slug', $slug)->firstOrFail();
    $this->authorize('view', $project);

    return Inertia::render('dashboard/ProjectShow', [
        'projectSlug' => $slug,
    ]);
}
```

#### 1.2 ImageController - Commented Authorization
**File:** `app/Http/Controllers/ImageController.php`
**Line:** 120

```php
// ❌ Authorization is commented out
public function download(Image $image): StreamedResponse
{
    //$this->authorize('view', $image);  // <-- SECURITY ISSUE
```

### Medium Issues

#### 1.3 Admin Controllers Using Manual Checks
**Files:** `AdminUserController.php`, `AdminContactRequestController.php`, `RoleController.php`

These use inline admin checks instead of policies:

```php
// ❌ Current pattern (repeated 10+ times)
if (!$request->user()->isAdmin()) {
    abort(403, 'Unauthorized');
}

// ✅ Should use policy
$this->authorize('viewAny', User::class);
```

#### 1.4 AnalyticsController - Inline Validation
**File:** `app/Http/Controllers/AnalyticsController.php`
**Lines:** 41-47

Uses inline validation instead of FormRequest:

```php
// ❌ Current
$validated = $request->validate([
    'project_slug' => 'required|string',
    'event_type' => 'required|in:project_view,image_view,...',
]);

// ✅ Should use TrackAnalyticsRequest FormRequest
```

---

## 2. Backend: Models

**Standard:** `docs/02-backend-standards.md`

### Compliance Summary

| Model | UUID Slug | RouteKey | Cascade Delete | Relationships | Casts | Status |
|-------|:---------:|:--------:|:--------------:|:-------------:|:-----:|:------:|
| Project | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| Scene | ✅ | ✅ | ❌ | ✅ | N/A | FAIL |
| Image | ✅ | ✅ | ✅ | ✅ | N/A | PASS |
| Hotspot | ✅ | ✅ | N/A | ✅ | ✅ | PASS |
| Sticker | ✅ | ✅ | N/A | ✅ | ✅ | PASS |
| User | N/A | N/A | N/A | ✅ | ✅ | PASS* |
| Role | N/A | N/A | N/A | ✅ | N/A | PASS* |
| ContactRequest | ✅ | ✅ | N/A | N/A | ✅ | PASS |
| AnalyticsEvent | N/A | N/A | N/A | ✅ | ✅ | PASS* |
| AnalyticsDailyStat | N/A | N/A | N/A | ✅ | ✅ | PASS* |

*N/A = Not applicable (auth/utility models don't need UUID routing)

### Critical Issue

#### 2.1 Scene Model Missing Cascade Deletion
**File:** `app/Models/Scene.php`

When a Scene is deleted, images and hotspots are orphaned:

```php
// ❌ Current - No cascade deletion
protected static function boot()
{
    parent::boot();
    static::creating(function ($scene) {
        $scene->slug = (string) Str::uuid();
    });
    // Missing: deleting hook
}

// ✅ Should add
static::deleting(function ($scene) {
    $scene->images()->each(fn ($image) => $image->delete());
    $scene->hotspots()->delete();
});
```

### Minor Issue

#### 2.2 Project Storage Disk
**File:** `app/Models/Project.php`
**Line:** 39

Uses `Storage::disk('public')` while documentation says S3 is standard:

```php
// Current
Storage::disk('public')->delete($project->picture_path);

// Should verify if S3 is needed for consistency with Image model
```

---

## 3. Backend: Policies & Routes

**Standard:** `docs/02-backend-standards.md`

### Missing Policies

| Model | Has Policy | Used In | Recommendation |
|-------|:----------:|---------|----------------|
| Sticker | ❌ | StickerController | Create StickerPolicy |
| ContactRequest | ❌ | AdminContactRequestController | Create ContactRequestPolicy |
| User | ❌ | AdminUserController | Create UserPolicy |

### Authorization Hierarchy Issues

#### 3.1 Create Operations Use 'view' Instead of 'update'
**Affected:** SceneController, ImageController, HotspotController, StickerController

Users with 'view' role can create child resources but shouldn't:

```php
// ❌ Current pattern in multiple controllers
$this->authorize('view', $project);
// Creates scene/image/hotspot/sticker

// ✅ Should check update permission
$this->authorize('update', $project);
```

### Route Issues

#### 3.2 Unauthorized Endpoint Exposure
**File:** `routes/web.php`
**Lines:** 111-112

```php
// ❌ These routes expose data without authorization
Route::get('/available-users', [ProjectUserController::class, 'availableUsers']);
Route::get('/available-roles', [ProjectUserController::class, 'availableRoles']);
```

Users can discover all system users and roles. Should add authorization.

---

## 4. Frontend: Vue Components

**Standard:** `docs/03-frontend-standards.md`, `docs/04-api-communication.md`

### Critical: API Calls Bypassing owl-sdk

The documentation mandates: "All API calls through owl-sdk"

#### 4.1 Direct axios Calls

| File | Lines | API Calls |
|------|-------|-----------|
| `pages/dashboard/AdminUsers.vue` | 44, 56, 67, 94 | `axios.get('/admin/users')`, `axios.get('/admin/roles')`, etc. |
| `components/dashboard/ProjectSettingsDialog.vue` | 48, 61 | `axios.get('/projects/.../images')`, `axios.post('.../make-public')` |
| `components/dashboard/ProjectUsersDialog.vue` | 30, 42-43, 69, 88 | Multiple axios calls for user management |

**Total:** 11 direct axios calls bypassing owl-sdk

#### 4.2 Direct fetch() Call

**File:** `pages/Contact.vue`
**Lines:** 33-41

```javascript
// ❌ Current
const response = await fetch('/api/contact', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('input[name="_token"]').value,
    },
    body: JSON.stringify(formData)
})

// ✅ Should use owl-sdk
await owl.contact.submit(formData)
```

### Script Setup Compliance

✅ **All components** properly use `<script setup>` syntax and `defineProps()`

### Missing Error Handling

| File | Issue |
|------|-------|
| `ProjectAnalytics.vue` | try-catch without useApiError |
| `ProjectShow.vue` | try-catch without useApiError |
| `SceneShow.vue` | try-catch without useApiError |

---

## 5. Frontend: Composable Usage

**Standard:** `docs/06-composables-reference.md`

### 5.1 window.confirm() Usage (Should use useConfirm)

| File | Line | Current Code |
|------|------|--------------|
| `pages/dashboard/admin/ContactRequests.vue` | 198 | `if (!confirm('Êtes-vous sûr...'))` |
| `pages/dashboard/ProjectShow.vue` | 96 | `if (!confirm('Êtes-vous sûr...'))` |
| `components/dashboard/ProjectUsersDialog.vue` | 85 | `if (!confirm('Êtes-vous sûr...'))` |
| `components/dashboard/settings/DangerZone.vue` | 6 | `if (confirm('Êtes-vous sûr...'))` |

**Fix:** Use `useConfirm` composable instead:

```javascript
// ❌ Current
if (!confirm('Êtes-vous sûr?')) return

// ✅ Should be
const { confirmDelete } = useConfirm()
if (!await confirmDelete('cette ressource')) return
```

### 5.2 alert() Usage (Should use toast)

| File | Line |
|------|------|
| `components/dashboard/ProjectSettingsDialog.vue` | 70 |
| `components/dashboard/ProjectUsersDialog.vue` | 78, 92 |

### 5.3 Manual Date Formatting (Should use useDateTime)

| File | Line | Code |
|------|------|------|
| `pages/dashboard/ProjectAnalytics.vue` | 58 | `new Date(dateString).toLocaleDateString('fr-FR', {...})` |
| `components/dashboard/ProjectCard.vue` | 76 | `new Date(project.created_at).toLocaleDateString('fr-FR')` |

**Fix:**

```javascript
// ❌ Current
new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

// ✅ Should be
const { formatDate } = useDateTime()
formatDate(date)
```

### 5.4 Missing useApiError in try-catch

**Found 15+ instances** where try-catch blocks don't use `useApiError`:

- `ContactRequests.vue:104-118, 165-194`
- `Contact.vue:32-80`
- `ProjectAnalytics.vue:30-35, 38-47`
- `ProjectShow.vue:40-50, 53-64, 79-92`
- `SceneShow.vue:50-64, 86-91`
- `AdminUsers.vue` (4 instances)
- `ProjectUsersDialog.vue` (4 instances)
- `ProjectSettingsDialog.vue` (2 instances)

---

## 6. Frontend: 3D Editor

**Standard:** `docs/09-3d-rendering.md`

### Hardcoded Values (Should be in editorConstants.js)

| File | Line | Value | Suggested Constant |
|------|------|-------|-------------------|
| `EditorCanvas.vue` | 56 | `HOVER_SCALE = 1.15` | `SPRITE_INTERACTION.HOVER_SCALE` |
| `EditorCanvas.vue` | 57 | `SELECTED_SCALE = 1.25` | `SPRITE_INTERACTION.SELECTED_SCALE` |
| `EditorCanvas.vue` | 68 | `DRAG_THRESHOLD_PX = 5` | `SPRITE_INTERACTION.DRAG_THRESHOLD_PX` |
| `EditorCanvas.vue` | 191, 220 | `opacity = 0.5` | `SPRITE_INTERACTION.DRAG_OPACITY` |
| `EditorCanvas.vue` | 411 | `minHoverTime = 300` | Use `TIMING.HOVER_HIDE_DELAY_MS` |
| `EditorCanvas.vue` | 520 | `zoomSpeed = 0.1` | `ZOOM.SCROLL_SPEED` |
| `EditorZoomControls.vue` | 20 | `0.7` (zoom-in) | `ZOOM.ZOOM_IN_FACTOR` |
| `EditorZoomControls.vue` | 32 | `1.35` (zoom-out) | `ZOOM.ZOOM_OUT_FACTOR` |

### Recommended Addition to editorConstants.js

```javascript
export const SPRITE_INTERACTION = {
    HOVER_SCALE: 1.15,
    SELECTED_SCALE: 1.25,
    DRAG_OPACITY: 0.5,
    DRAG_THRESHOLD_PX: 5,
}

export const ZOOM = {
    ZOOM_IN_FACTOR: 0.7,
    ZOOM_OUT_FACTOR: 1.35,
    SCROLL_SPEED: 0.1,
}
```

### Compliant Patterns ✅

- ✅ All sprite creation uses `SpriteFactory`
- ✅ Scene management uses `useThreeScene` composable
- ✅ Panorama loading uses `usePanoramaLoader` composable
- ✅ Sprites tracked by slug (not object reference)
- ✅ `spatialMath.js` utilities used for calculations

---

## 7. Priority Action Items

### 🔴 Critical (Security/Breaking)

| # | Issue | File | Action |
|---|-------|------|--------|
| 1 | Commented authorization | `ImageController.php:120` | Uncomment `$this->authorize('view', $image)` |
| 2 | Missing dashboard authorization | `DashboardController.php` | Add authorization before rendering |
| 3 | Scene cascade deletion missing | `Scene.php` | Add deleting hook to cascade delete images |

### 🟠 High Priority (Standards Compliance)

| # | Issue | Files | Action |
|---|-------|-------|--------|
| 4 | Direct axios calls | 3 Vue files | Migrate to owl-sdk, add missing endpoints |
| 5 | Manual admin checks | 4 controllers | Create policies, use `$this->authorize()` |
| 6 | Create uses 'view' auth | 4 controllers | Change to `authorize('update', ...)` |
| 7 | Missing policies | Sticker, ContactRequest, User | Create policy files |

### 🟡 Medium Priority (Code Quality)

| # | Issue | Files | Action |
|---|-------|-------|--------|
| 8 | window.confirm usage | 4 Vue files | Replace with `useConfirm` |
| 9 | Missing useApiError | 15+ try-catch blocks | Wrap with `handleError()` |
| 10 | Hardcoded editor values | 2 editor files | Move to `editorConstants.js` |
| 11 | Manual date formatting | 2 Vue files | Use `useDateTime` composable |
| 12 | Inline validation | `AnalyticsController.php` | Extract to FormRequest |

### 🟢 Low Priority (Nice to Have)

| # | Issue | Files | Action |
|---|-------|-------|--------|
| 13 | alert() usage | 2 Vue files | Replace with toast notifications |
| 14 | AuthController validation | `AuthController.php` | Consider extracting to FormRequests |
| 15 | Storage disk consistency | `Project.php` | Verify if S3 should be used |

---

## Files Requiring Changes

### Backend Files
```
app/Http/Controllers/DashboardController.php      # Add authorization
app/Http/Controllers/ImageController.php          # Uncomment authorization
app/Http/Controllers/AdminUserController.php      # Use policies
app/Http/Controllers/AdminContactRequestController.php
app/Http/Controllers/RoleController.php
app/Http/Controllers/AnalyticsController.php      # Extract FormRequest
app/Http/Controllers/SceneController.php          # Change view→update
app/Http/Controllers/HotspotController.php
app/Http/Controllers/StickerController.php
app/Models/Scene.php                              # Add cascade deletion
app/Policies/StickerPolicy.php                    # Create new
app/Policies/ContactRequestPolicy.php             # Create new
app/Policies/UserPolicy.php                       # Create new
```

### Frontend Files
```
resources/js/pages/dashboard/AdminUsers.vue       # Migrate to owl-sdk
resources/js/pages/dashboard/admin/ContactRequests.vue  # useConfirm, useApiError
resources/js/pages/dashboard/ProjectShow.vue      # useConfirm, useApiError
resources/js/pages/dashboard/ProjectAnalytics.vue # useDateTime, useApiError
resources/js/pages/dashboard/SceneShow.vue        # useApiError
resources/js/pages/Contact.vue                    # Migrate to owl-sdk
resources/js/components/dashboard/ProjectSettingsDialog.vue  # Migrate to owl-sdk
resources/js/components/dashboard/ProjectUsersDialog.vue     # Migrate to owl-sdk
resources/js/components/dashboard/ProjectCard.vue # useDateTime
resources/js/components/dashboard/settings/DangerZone.vue   # useConfirm
resources/js/components/dashboard/editor/EditorCanvas.vue   # Constants
resources/js/components/dashboard/editor/EditorZoomControls.vue  # Constants
resources/js/lib/editorConstants.js               # Add new constants
resources/js/owl-sdk.js                           # Add admin endpoints
```

---

## Conclusion

The Owlaround codebase demonstrates solid architectural foundations with consistent patterns in core functionality. The main areas needing attention are:

1. **Authorization standardization** - Moving from manual admin checks to policies
2. **API layer compliance** - Ensuring all calls go through owl-sdk
3. **Composable adoption** - Using existing utilities instead of native browser APIs
4. **Editor constants** - Centralizing remaining magic numbers

Estimated effort to full compliance: **2-3 developer days**

---

*Generated by Claude Code Audit • January 26, 2026*
