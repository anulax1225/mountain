# API Communication (owl-sdk)

This document defines the standard patterns for API communication using the owl-sdk in the Owlaround platform.

## Table of Contents

- [Overview](#overview)
- [SDK Structure](#sdk-structure)
- [CRUD Operations](#crud-operations)
- [File Uploads](#file-uploads)
- [Error Handling](#error-handling)
- [Response Handling](#response-handling)

---

## Overview

**CRITICAL: All API calls MUST go through owl-sdk.** Never use raw `fetch()` or `axios` directly.

The owl-sdk provides:
- Automatic authentication token management
- Consistent error handling
- Request/response interceptors
- Retry logic with exponential backoff
- Type-safe API methods

### Import

```javascript
import { owl } from '@/owl-sdk'
```

---

## SDK Structure

The owl-sdk exposes API modules matching the backend resources:

```javascript
owl.auth        // Authentication (login, logout, tokens)
owl.projects    // Projects CRUD
owl.scenes      // Scenes CRUD
owl.images      // Images CRUD + upload
owl.hotspots    // Hotspots CRUD
owl.stickers    // Stickers CRUD
owl.analytics   // Analytics tracking
owl.contactRequests  // Contact form
```

### Available Methods per Module

**owl.auth:**
```javascript
owl.auth.login(email, password)     // Login and get token
owl.auth.logout()                   // Logout and clear token
owl.auth.check()                    // Verify token validity
owl.auth.user()                     // Get current user
```

**owl.projects:**
```javascript
owl.projects.list()                 // GET /projects
owl.projects.get(slug)              // GET /projects/{slug}
owl.projects.create(data)           // POST /projects
owl.projects.update(slug, data)     // PUT /projects/{slug}
owl.projects.patch(slug, data)      // PATCH /projects/{slug}
owl.projects.delete(slug)           // DELETE /projects/{slug}
owl.projects.makePublic(slug, data) // POST /projects/{slug}/make-public
owl.projects.images(slug)           // GET /projects/{slug}/images
```

**owl.scenes:**
```javascript
owl.scenes.list(projectSlug)        // GET /projects/{slug}/scenes
owl.scenes.get(slug)                // GET /scenes/{slug}
owl.scenes.create(projectSlug, data) // POST /projects/{slug}/scenes
owl.scenes.update(slug, data)       // PUT /scenes/{slug}
owl.scenes.delete(slug)             // DELETE /scenes/{slug}
```

**owl.images:**
```javascript
owl.images.list(sceneSlug)          // GET /scenes/{slug}/images
owl.images.get(slug)                // GET /images/{slug}
owl.images.upload(sceneSlug, file)  // POST /scenes/{slug}/images
owl.images.update(slug, data)       // POST /images/{slug} (multipart)
owl.images.delete(slug)             // DELETE /images/{slug}
owl.images.download(slug)           // GET /images/{slug}/download
```

**owl.hotspots:**
```javascript
owl.hotspots.list(sceneSlug)        // GET /scenes/{slug}/hotspots
owl.hotspots.get(slug)              // GET /hotspots/{slug}
owl.hotspots.create(sceneSlug, data) // POST /scenes/{slug}/hotspots
owl.hotspots.update(slug, data)     // PUT /hotspots/{slug}
owl.hotspots.delete(slug)           // DELETE /hotspots/{slug}
```

**owl.stickers:**
```javascript
owl.stickers.list(imageSlug)        // GET /images/{slug}/stickers
owl.stickers.get(slug)              // GET /stickers/{slug}
owl.stickers.create(imageSlug, data) // POST /images/{slug}/stickers
owl.stickers.update(slug, data)     // PUT /stickers/{slug}
owl.stickers.delete(slug)           // DELETE /stickers/{slug}
```

---

## CRUD Operations

### List (GET collection)

```javascript
const loadProjects = async () => {
  try {
    const response = await owl.projects.list()
    projects.value = response.data || []
  } catch (error) {
    console.error('Failed to load projects:', error)
  }
}
```

**Response structure:**
```javascript
{
  data: [...],           // Array of resources
  meta: {
    current_page: 1,
    last_page: 5,
    per_page: 15,
    total: 73,
  },
  links: {
    first: '...',
    last: '...',
    prev: null,
    next: '...',
  }
}
```

### Show (GET single)

```javascript
const loadProject = async () => {
  try {
    const response = await owl.projects.get(props.projectSlug)
    project.value = response  // Direct resource, not wrapped in data
  } catch (error) {
    console.error('Failed to load project:', error)
  }
}
```

**Response structure:**
```javascript
{
  id: 1,
  slug: 'abc-123',
  name: 'My Project',
  // ... other fields
  permissions: {
    can_edit: true,
    can_delete: false,
  }
}
```

### Create (POST)

```javascript
const createProject = async () => {
  try {
    const response = await owl.projects.create({
      name: form.value.name,
      description: form.value.description,
    })

    // response is the created resource
    console.log('Created:', response.slug)

    // Refresh list
    await loadProjects()
  } catch (error) {
    console.error('Failed to create project:', error)
  }
}
```

### Update (PUT/PATCH)

```javascript
const updateProject = async () => {
  try {
    // Full update (PUT)
    await owl.projects.update(project.value.slug, {
      name: form.value.name,
      description: form.value.description,
    })

    // OR partial update (PATCH)
    await owl.projects.patch(project.value.slug, {
      name: form.value.name,
    })

    // Refresh data
    await loadProject()
  } catch (error) {
    console.error('Failed to update project:', error)
  }
}
```

### Delete (DELETE)

```javascript
const deleteProject = async () => {
  try {
    await owl.projects.delete(project.value.slug)

    // Navigate away or refresh list
    router.push('/dashboard')
  } catch (error) {
    console.error('Failed to delete project:', error)
  }
}
```

---

## File Uploads

### Image Upload

Use FormData for file uploads:

```javascript
const uploadImage = async (file) => {
  try {
    // owl.images.upload handles FormData internally
    const response = await owl.images.upload(props.sceneSlug, file)

    console.log('Uploaded:', response.slug)
    await loadImages()
  } catch (error) {
    console.error('Failed to upload image:', error)
  }
}
```

### With FormData (for additional fields)

```javascript
const createProject = async () => {
  try {
    const formData = new FormData()
    formData.append('name', form.value.name)

    if (form.value.description) {
      formData.append('description', form.value.description)
    }

    if (form.value.photo) {
      formData.append('photo', form.value.photo)
    }

    await owl.projects.create(formData)

    // Reset form
    form.value = { name: '', description: '', photo: null }
    await loadProjects()
  } catch (error) {
    console.error('Failed to create project:', error)
  }
}
```

### Update with File Replacement

```javascript
const updateImage = async () => {
  try {
    const formData = new FormData()

    if (form.value.name) {
      formData.append('name', form.value.name)
    }

    if (form.value.newImage) {
      formData.append('image', form.value.newImage)
    }

    // POST for multipart (not PUT)
    await owl.images.update(image.value.slug, formData)

    await loadImage()
  } catch (error) {
    console.error('Failed to update image:', error)
  }
}
```

### Upload Progress Tracking

Use the `useImageUpload` composable for progress:

```javascript
import { useImageUpload } from '@/composables'

const { uploadFiles, isUploading, uploadProgress, errors } = useImageUpload({
  maxFileSize: 50 * 1024 * 1024,  // 50MB
  validateEquirectangular: true,
})

const handleUpload = async (files) => {
  const result = await uploadFiles(files, async (formData) => {
    const file = formData.get('file')
    return await owl.images.upload(props.sceneSlug, file)
  }, (progress) => {
    console.log(`Upload progress: ${progress}%`)
  })

  if (result.success) {
    await loadImages()
  }
}
```

---

## Error Handling

### Basic Try-Catch Pattern

```javascript
const loadData = async () => {
  try {
    loading.value = true
    const response = await owl.projects.get(slug)
    project.value = response
  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    loading.value = false
  }
}
```

### With useApiError Composable

```javascript
import { useApiError } from '@/composables'

const { handleError } = useApiError()

const deleteHotspot = async (hotspot) => {
  try {
    await owl.hotspots.delete(hotspot.slug)
    await reloadImages()
  } catch (error) {
    handleError(error, {
      context: 'Deleting hotspot',
      showToast: true,
    })
  }
}
```

### Error Response Structure

**Validation errors (422):**
```javascript
{
  message: 'The given data was invalid.',
  errors: {
    name: ['The name field is required.'],
    email: ['The email must be a valid email address.'],
  }
}
```

**Authorization errors (403):**
```javascript
{
  message: 'This action is unauthorized.'
}
```

**Not found errors (404):**
```javascript
{
  message: 'No query results for model [App\\Models\\Project].'
}
```

### Handling Specific Error Types

```javascript
import { useApiError } from '@/composables'

const { handleError, isValidationError, getValidationErrors } = useApiError()

const saveForm = async () => {
  try {
    await owl.projects.create(form.value)
  } catch (error) {
    if (isValidationError(error)) {
      // Get field-specific errors
      const errors = getValidationErrors(error)
      formErrors.value = errors
    } else {
      handleError(error, { showToast: true })
    }
  }
}
```

### Retry Logic

```javascript
import { useApiError } from '@/composables'

const { withRetry } = useApiError()

const loadWithRetry = async () => {
  try {
    const response = await withRetry(
      () => owl.projects.get(slug),
      {
        maxRetries: 3,
        backoff: true,  // Exponential backoff
      }
    )
    project.value = response
  } catch (error) {
    // All retries failed
    handleError(error)
  }
}
```

---

## Response Handling

### Accessing Paginated Data

```javascript
const loadProjects = async (page = 1) => {
  try {
    const response = await owl.projects.list({ page, per_page: 15 })

    projects.value = response.data
    pagination.value = {
      currentPage: response.meta.current_page,
      lastPage: response.meta.last_page,
      total: response.meta.total,
    }
  } catch (error) {
    console.error('Failed to load projects:', error)
  }
}
```

### Accessing Nested Data

```javascript
const loadProjectWithScenes = async () => {
  try {
    // Backend returns project with nested scenes and images
    const response = await owl.projects.get(slug)

    project.value = response
    scenes.value = response.scenes || []

    // Access images within scenes
    const allImages = scenes.value.flatMap(scene => scene.images || [])
  } catch (error) {
    console.error('Failed to load project:', error)
  }
}
```

### Accessing Permission Flags

```javascript
const loadProject = async () => {
  try {
    const response = await owl.projects.get(slug)
    project.value = response

    // Use permissions for UI decisions
    canEdit.value = response.permissions?.can_edit ?? false
    canDelete.value = response.permissions?.can_delete ?? false
    isOwner.value = response.permissions?.is_owner ?? false
  } catch (error) {
    console.error('Failed to load project:', error)
  }
}
```

---

## Common Patterns

### Load Parent then Children

```javascript
const loadProject = async () => {
  try {
    loading.value = true

    // Load project
    const projectResponse = await owl.projects.get(props.projectSlug)
    project.value = projectResponse

    // Load scenes
    const scenesResponse = await owl.scenes.list(props.projectSlug)
    scenes.value = scenesResponse.data || []

    // Load images for each scene
    for (const scene of scenes.value) {
      const imagesResponse = await owl.images.list(scene.slug)
      scene.images = imagesResponse.data || []
    }
  } catch (error) {
    console.error('Failed to load project:', error)
  } finally {
    loading.value = false
  }
}
```

### Optimistic Updates

```javascript
const togglePublic = async () => {
  // Optimistic update
  const previousValue = project.value.is_public
  project.value.is_public = !previousValue

  try {
    await owl.projects.makePublic(project.value.slug, {
      is_public: project.value.is_public,
    })
  } catch (error) {
    // Revert on failure
    project.value.is_public = previousValue
    handleError(error)
  }
}
```

### Refresh After Mutation

```javascript
const createScene = async () => {
  try {
    await owl.scenes.create(project.value.slug, {
      name: form.value.name,
    })

    // Close dialog
    dialogOpen.value = false

    // Refresh scenes list
    await loadScenes()
  } catch (error) {
    handleError(error)
  }
}
```

### Delete with Confirmation

```javascript
import { useConfirm } from '@/composables'

const { confirmDelete } = useConfirm()

const deleteImage = async (image) => {
  const confirmed = await confirmDelete('cette image')
  if (!confirmed) return

  try {
    await owl.images.delete(image.slug)
    await loadImages()
  } catch (error) {
    handleError(error, { context: 'Deleting image' })
  }
}
```

---

## Quick Reference

### API Call Checklist

- [ ] Use owl-sdk (never raw fetch/axios)
- [ ] Wrap in try-catch
- [ ] Handle loading state
- [ ] Handle errors with useApiError
- [ ] Refresh data after mutations
- [ ] Use FormData for file uploads

### Method Mapping

| Operation | HTTP Method | SDK Method |
|-----------|-------------|------------|
| List | GET | `.list()` |
| Show | GET | `.get(slug)` |
| Create | POST | `.create(data)` |
| Update | PUT | `.update(slug, data)` |
| Partial Update | PATCH | `.patch(slug, data)` |
| Delete | DELETE | `.delete(slug)` |
| Upload | POST | `.upload(parentSlug, file)` |

### Response Access

| Response Type | Access Pattern |
|---------------|----------------|
| Paginated list | `response.data` (array) |
| Single resource | `response` (object) |
| Pagination meta | `response.meta` |
| Permissions | `response.permissions` |
| Nested relations | `response.scenes`, `response.images` |
