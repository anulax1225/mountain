# Composables Reference

This document provides a complete reference for all Vue 3 composables available in the Owlaround platform.

## Table of Contents

- [Import Pattern](#import-pattern)
- [Utility Composables](#utility-composables)
- [User Interaction Composables](#user-interaction-composables)
- [Data Management Composables](#data-management-composables)
- [File Operation Composables](#file-operation-composables)
- [Pagination Composables](#pagination-composables)
- [3D Editor Composables](#3d-editor-composables)

---

## Import Pattern

**CRITICAL: Always import from `@/composables` index file.**

```javascript
// Correct
import { useConfirm, useApiError, useDateTime } from '@/composables'

// Also correct (direct import if needed)
import { useConfirm } from '@/composables/useConfirm'

// Never reimplement functionality that exists in composables
```

---

## Utility Composables

### useImagePath

Generate image URLs from storage paths.

```javascript
import { useImagePath } from '@/composables'

const { getImageUrl, getThumbnailUrl, getImagePreview, isValidImageUrl } = useImagePath()

// Get full URL from storage path
const imageUrl = getImageUrl(image.path)
// → "https://s3.../images/abc123.jpg"

// Get thumbnail URL with size variant
const thumbUrl = getThumbnailUrl(image.path, 'medium')
// → "https://s3.../thumbnails/medium/abc123.jpg"

// Get best preview (thumbnail fallback to full)
const preview = getImagePreview(image)

// Validate image URL
const isValid = isValidImageUrl('https://example.com/image.jpg')
// → true
```

**When to use:** Always use for image URL generation. Never concatenate paths manually.

---

### useDateTime

Date and time formatting with French localization.

```javascript
import { useDateTime } from '@/composables'

const {
  formatDate,
  formatTime,
  formatDateTime,
  formatShortDate,
  formatLongDate,
  formatNumericDate,
  formatSmartDate,
  relativeTime,
  relativeTimeShort,
  isToday,
  isYesterday,
  parseDate,
  addDays,
  diffInDays,
} = useDateTime('fr-FR')  // Optional locale, defaults to 'fr-FR'

// Smart formatting (Today/Yesterday/weekday/full)
formatSmartDate(new Date())
// → "Aujourd'hui à 14:30"

formatSmartDate(yesterday)
// → "Hier à 10:15"

// Relative time
relativeTime(twoHoursAgo)
// → "il y a 2 heures"

relativeTimeShort(twoHoursAgo)
// → "2h"

// Standard formats
formatDate(date)           // → "26 janvier 2026"
formatTime(date)           // → "14:30"
formatDateTime(date)       // → "26 janvier 2026 à 14:30"
formatShortDate(date)      // → "26 janv."
formatLongDate(date)       // → "lundi 26 janvier 2026"
formatNumericDate(date)    // → "26/01/2026"

// Date helpers
isToday(date)              // → true/false
isYesterday(date)          // → true/false
parseDate('2026-01-26')    // → Date object
addDays(date, 7)           // → Date 7 days later
diffInDays(date1, date2)   // → Number of days
```

**When to use:** Always use for date display. Never use raw `Intl.DateTimeFormat`.

---

### useFileSize

Format file sizes as human-readable strings.

```javascript
import { useFileSize } from '@/composables'

const {
  formatBytes,
  formatBytesShort,
  parseFileSize,
  convertTo,
  getFileSizeCategory,
  compareFileSizes,
  sumFileSizes,
  formatSpeed,
  estimateDownloadTime,
  formatDownloadTime,
} = useFileSize()

// Format bytes
formatBytes(12582912)       // → "12.5 Mo"
formatBytesShort(12582912)  // → "12M"

// Parse size string
parseFileSize('12.5 Mo')    // → 12582912

// Categorize
getFileSizeCategory(12582912)  // → "large"
// Categories: "tiny" | "small" | "medium" | "large" | "huge"

// Compare
compareFileSizes(1024, 2048)  // → -1 (first is smaller)

// Sum array of sizes
sumFileSizes([1024, 2048, 4096])  // → 7168

// Transfer speed
formatSpeed(1048576)  // → "1 Mo/s"

// Download estimate
estimateDownloadTime(104857600, 1048576)  // → 100 (seconds)
formatDownloadTime(100)  // → "1 min 40 s"
```

**When to use:** Always use for file size display.

---

## User Interaction Composables

### useConfirm

Programmatic confirmation dialogs.

```javascript
import { useConfirm } from '@/composables'

const { confirm, confirmDelete, confirmLeave, confirmAction } = useConfirm()

// Generic confirmation
const confirmed = await confirm({
  title: 'Confirmer l\'action',
  message: 'Êtes-vous sûr de vouloir continuer ?',
  confirmText: 'Confirmer',
  cancelText: 'Annuler',
  variant: 'default',  // 'default' | 'destructive'
})

if (confirmed) {
  // User clicked confirm
}

// Pre-configured delete confirmation
const deleteConfirmed = await confirmDelete('cette image')
// Shows: "Êtes-vous sûr de vouloir supprimer cette image ?"

// Pre-configured leave confirmation
const leaveConfirmed = await confirmLeave(hasUnsavedChanges)

// Pre-configured action confirmations
await confirmAction('publish', 'ce projet')  // publish/archive/restore/duplicate
```

**When to use:** Always use for user confirmations. Never use `window.confirm()`.

---

### useDialog

Dialog state management with accessibility.

```javascript
import { useDialog } from '@/composables'

const dialog = useDialog({
  closeOnEscape: true,       // Close on Escape key
  closeOnClickOutside: false, // Close when clicking outside
  onOpen: () => console.log('Dialog opened'),
  onClose: () => console.log('Dialog closed'),
})

// State
dialog.isOpen.value  // boolean

// Methods
dialog.open()   // Open and store previous focus
dialog.close()  // Close and restore focus
dialog.toggle() // Toggle state

// Template ref for focus trapping
<div ref="dialog.dialogElement">
```

**Features:**
- Escape key handling
- Focus trapping
- Body scroll lock
- Click outside detection
- Focus restoration

---

### useViewMode

Persistent view mode state (grid/list/slider).

```javascript
import { useViewMode } from '@/composables'

const {
  viewMode,
  availableModes,
  setViewMode,
  toggleViewMode,
  isGrid,
  isList,
  isSlider,
  getViewModeIcon,
  getViewModeLabel,
} = useViewMode('imagesView', 'grid', ['grid', 'list', 'slider'])
//              ^ storage key   ^ default  ^ available modes

// Current mode
viewMode.value  // 'grid' | 'list' | 'slider'

// Set specific mode
setViewMode('list')

// Cycle through modes
toggleViewMode()  // grid → list → slider → grid

// Computed checks
isGrid.value   // true if viewMode === 'grid'
isList.value   // true if viewMode === 'list'
isSlider.value // true if viewMode === 'slider'

// UI helpers
getViewModeIcon.value   // 'LayoutGrid' | 'List' | 'Columns'
getViewModeLabel.value  // 'Grille' | 'Liste' | 'Diaporama'
```

**When to use:** For any list that supports multiple view modes.

---

### useTheme

Dark mode theme management.

```javascript
import { useTheme } from '@/composables'

const { theme, isDark, isLight, setTheme, toggleTheme } = useTheme()

// Current theme
theme.value  // 'dark' | 'light' | 'system'
isDark.value // true if dark mode active
isLight.value // true if light mode active

// Set theme
setTheme('dark')
setTheme('light')
setTheme('system')

// Toggle between dark/light
toggleTheme()
```

---

## Data Management Composables

### useResource

Fetch single resources with caching and retry.

```javascript
import { useResource, useProject, useScene, useImage } from '@/composables'

// Generic usage
const { data, isLoading, error, isEmpty, hasError, isStale, fetchData, refresh, update, remove, clearCache } = useResource(
  () => owl.projects.get(slug),  // Fetch function
  {
    immediate: true,     // Fetch on mount
    cache: true,         // Enable caching (5min default)
    cacheKey: `project-${slug}`,
    retryOnError: true,
    maxRetries: 3,
    onSuccess: (data) => console.log('Loaded:', data),
    onError: (error) => console.error('Failed:', error),
    transform: (data) => data,  // Transform response
  }
)

// Convenience functions for common resources
const { data: project, isLoading, refresh } = useProject(projectSlug, { immediate: true })
const { data: scene } = useScene(sceneSlug)
const { data: image } = useImage(imageSlug)

// Methods
await fetchData()        // Fetch (uses cache if available)
await fetchData(true)    // Force refresh (bypass cache)
await refresh()          // Alias for fetchData(true)
update({ name: 'New' })  // Optimistically update cached data
remove()                 // Clear resource and cache
clearCache()             // Clear only cache entry
```

**When to use:** For fetching single resources with caching needs.

---

### useApiError

Centralized API error handling.

```javascript
import { useApiError } from '@/composables'

const {
  handleError,
  getErrorMessage,
  isNetworkError,
  isValidationError,
  isAuthError,
  getValidationErrors,
  withRetry,
  lastError,
} = useApiError()

// Handle error with toast
try {
  await owl.projects.delete(slug)
} catch (error) {
  handleError(error, {
    context: 'Deleting project',  // Shown in console
    showToast: true,              // Show toast notification
    onRetry: () => retryDelete(), // Add retry button to toast
  })
}

// Get user-friendly message
const message = getErrorMessage(error)
// → "Le nom est obligatoire." (for validation)
// → "Vous n'avez pas les droits nécessaires." (for 403)
// → "Ressource introuvable." (for 404)

// Check error type
isNetworkError(error)    // Network/connection error
isValidationError(error) // 422 validation error
isAuthError(error)       // 401/403 auth error

// Get validation errors object
const errors = getValidationErrors(error)
// → { name: ['The name field is required.'] }

// Retry with exponential backoff
const result = await withRetry(
  () => owl.projects.get(slug),
  {
    maxRetries: 3,
    backoff: true,  // 1s, 2s, 4s delays
  }
)

// Access last error
lastError.value  // Last error encountered
```

**When to use:** Always use for API error handling. Never show raw error messages.

---

### useForm

Form state management with validation.

```javascript
import { useForm, validators } from '@/composables'

const form = useForm(
  // Initial values
  {
    name: '',
    email: '',
    description: '',
  },
  // Options
  {
    validate: {
      name: [validators.required(), validators.minLength(3)],
      email: [validators.required(), validators.email()],
      description: validators.maxLength(500),
    },
    onSuccess: (response) => {
      router.push('/success')
    },
    resetOnSuccess: true,
  }
)

// State
form.data.value         // Form data object
form.errors.value       // Validation errors { field: ['message'] }
form.isSubmitting.value // Submission in progress
form.isDirty.value      // Form has been modified
form.hasErrors.value    // Has validation errors
form.touched            // Set of touched field names

// Methods
form.setData('name', 'value')     // Update field value
form.setErrors({ name: ['Error'] }) // Set errors
form.clearErrors()                // Clear all errors
form.clearError('name')           // Clear field error
form.validateField('name')        // Validate single field
form.validateAll()                // Validate entire form
form.reset()                      // Reset to initial values
form.fill({ name: 'New' })        // Fill with new data

// Field helpers
form.hasError('name')   // true if field has error
form.getError('name')   // First error message for field
form.isTouched('name')  // true if field was touched
form.touch('name')      // Mark field as touched

// Submit
form.submit(async (data) => {
  return await owl.projects.create(data)
})
```

**Available validators:**

```javascript
validators.required()           // Field is required
validators.minLength(3)         // Min length
validators.maxLength(500)       // Max length
validators.email()              // Valid email format
validators.url()                // Valid URL format
validators.min(0)               // Min numeric value
validators.max(100)             // Max numeric value
validators.pattern(/regex/)     // Match pattern
validators.matches('password')  // Match another field
```

---

## File Operation Composables

### useImageUpload

Image upload with validation and progress.

```javascript
import { useImageUpload } from '@/composables'

const {
  isUploading,
  uploadProgress,
  uploadedFiles,
  errors,
  hasErrors,
  successCount,
  errorCount,
  validateFiles,
  uploadFile,
  uploadFiles,
  reset,
} = useImageUpload({
  maxFileSize: 50 * 1024 * 1024,  // 50MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  validateEquirectangular: true,  // Check 2:1 aspect ratio
  onSuccess: (files) => console.log('Uploaded:', files),
  onError: (errors) => console.error('Errors:', errors),
})

// Validate before upload
const validationErrors = await validateFiles(fileList)

// Upload single file
await uploadFile(file, async (formData) => {
  return await owl.images.upload(sceneSlug, formData.get('file'))
}, (progress) => {
  console.log(`Progress: ${progress}%`)
})

// Upload multiple files
const result = await uploadFiles(fileList, async (formData) => {
  const file = formData.get('file')
  return await owl.images.upload(sceneSlug, file)
}, (progress) => {
  console.log(`Progress: ${progress}%`)
})

if (result.success) {
  console.log('All files uploaded')
}

// Reset state
reset()
```

**When to use:** Always use for image uploads. Handles validation and progress automatically.

---

### useFileDownload

File downloads with progress tracking.

```javascript
import { useFileDownload } from '@/composables'

const {
  isDownloading,
  downloadProgress,
  downloadFromUrl,
  downloadFromResponse,
  downloadMultiple,
  downloadBlob,
  downloadAsJson,
  downloadAsText,
  downloadAsCsv,
  extractFilename,
} = useFileDownload()

// Download from URL
await downloadFromUrl(
  `/api/images/${imageSlug}/download`,
  'panorama.jpg',
  {
    onProgress: (progress) => console.log(`${progress}%`),
  }
)

// Download blob
downloadBlob(blob, 'file.txt')

// Export data as JSON
downloadAsJson(projectData, 'project-export.json')

// Export as CSV
downloadAsCsv(data, 'export.csv', ['Name', 'Email', 'Date'])

// Download multiple files
await downloadMultiple([
  { url: '/api/images/1/download', filename: 'image1.jpg' },
  { url: '/api/images/2/download', filename: 'image2.jpg' },
], { concurrent: 2 })
```

---

## Pagination Composables

### usePagination

Traditional page-based pagination.

```javascript
import { usePagination } from '@/composables'

const pagination = usePagination({
  initialPage: 1,
  initialPerPage: 15,
  total: 0,
  persistState: true,
  storageKey: 'imagesPagination',
  onPageChange: async (newPage, oldPage) => {
    await loadImages(newPage)
  },
})

// State
pagination.currentPage.value   // Current page number
pagination.perPage.value       // Items per page
pagination.totalItems.value    // Total item count
pagination.totalPages.value    // Computed total pages
pagination.offset.value        // Computed offset for API
pagination.hasNextPage.value   // Can go forward
pagination.hasPreviousPage.value // Can go back
pagination.isFirstPage.value   // On first page
pagination.isLastPage.value    // On last page
pagination.startItem.value     // "Showing 11..."
pagination.endItem.value       // "...to 20"
pagination.pageRange.value     // [1, 2, '...', 5, 6] with ellipsis

// Navigation
pagination.goToPage(3)
pagination.nextPage()
pagination.previousPage()
pagination.firstPage()
pagination.lastPage()

// Configuration
pagination.setPerPage(25)
pagination.setTotal(150)
pagination.reset()

// Client-side pagination
const paginatedItems = pagination.paginateArray(allItems)
```

---

### useInfiniteScroll

Infinite scrolling with load-more.

```javascript
import { useInfiniteScroll, useInfiniteScrollObserver } from '@/composables'

// Scroll-distance based
const scroll = useInfiniteScroll({
  loadMore: async (page, perPage) => {
    const response = await owl.projects.list({ page, per_page: perPage })
    return {
      data: response.data,
      total: response.meta.total,
    }
  },
  threshold: 200,  // Distance from bottom to trigger
  perPage: 20,
})

// State
scroll.items.value      // Loaded items
scroll.isLoading.value  // Loading more
scroll.hasMore.value    // More items available
scroll.currentPage.value
scroll.error.value
scroll.canLoadMore.value

// Methods
scroll.load()           // Manually trigger load
scroll.reset()          // Clear items and reset
scroll.refresh()        // Reset and reload
scroll.append(items)    // Add items to end
scroll.prepend(items)   // Add items to start
scroll.remove((item) => item.id === targetId)  // Remove by condition
scroll.update((item) => item.id === targetId, { name: 'Updated' })  // Update item

// IntersectionObserver based (more efficient)
const { items, sentinelElement, isLoading, hasMore } = useInfiniteScrollObserver({
  loadMore: async (page, perPage) => {
    const response = await owl.projects.list({ page, per_page: perPage })
    return { data: response.data, total: response.meta.total }
  },
})

// Template: place sentinel at end of list
<div ref="sentinelElement" class="h-1"></div>
```

---

## 3D Editor Composables

### useThreeScene

Three.js scene initialization and lifecycle.

```javascript
import { useThreeScene } from '@/composables/useThreeScene'
import { CAMERA, CONTROLS } from '@/lib/editorConstants'

const containerRef = ref(null)

const {
  threeScene,
  camera,
  renderer,
  controls,
  init,
  dispose,
} = useThreeScene(containerRef, {
  // All options optional - defaults from editorConstants
  fov: CAMERA.FOV,
  near: CAMERA.NEAR,
  far: CAMERA.FAR,
  onReady: () => console.log('Scene ready'),
  onAnimate: (delta) => {
    // Called each frame
  },
})

onMounted(() => {
  init()  // Handles animation loop, resize, cleanup
})

onUnmounted(() => {
  dispose()  // Clean up Three.js resources
})
```

**Features:**
- Automatic animation loop
- Resize handling
- Resource cleanup
- OrbitControls configuration

---

### usePanoramaLoader

Load 360° panoramic images with transitions.

```javascript
import { usePanoramaLoader } from '@/composables/usePanoramaLoader'

const { loadPanorama, isLoading, currentTexture } = usePanoramaLoader(threeScene, textureLoader)

// Load panorama with fade transition
await loadPanorama(
  '/storage/images/panorama.jpg',  // Image URL
  true,                             // Enable fade transition
  { x: 0.5, y: 0.3, z: 0 },        // Optional camera rotation
  controls.value                    // OrbitControls instance
)

// Load without transition
await loadPanorama(imageUrl, false)
```

---

### useEditorInteraction

Editor interaction state management.

```javascript
import { useEditorInteraction } from '@/composables'

const interaction = useEditorInteraction()

// State (track by slug, not object reference)
interaction.hoveredHotspotSlug.value  // string | null
interaction.hoveredStickerSlug.value  // string | null
interaction.selectedStickerSlug.value // string | null
interaction.draggedSpriteSlug.value   // string | null
interaction.draggedSpriteType.value   // 'hotspot' | 'sticker' | null

// Setters
interaction.setHoveredHotspot(slug)
interaction.setHoveredSticker(slug)
interaction.setSelectedSticker(slug)
interaction.setDraggedSprite(slug, type)

// Clear methods
interaction.clearHoverStates()    // Clear hover states only
interaction.clearSelection()      // Clear selection
interaction.clearDragState()      // Clear drag state
interaction.clearAllStates()      // Clear everything
```

**When to use:** For managing 3D editor interaction state across components.

---

## Quick Reference

### Composable Selection Guide

| Need | Composable |
|------|------------|
| Image URLs | `useImagePath` |
| Date formatting | `useDateTime` |
| File size display | `useFileSize` |
| Confirmation dialogs | `useConfirm` |
| Dialog state | `useDialog` |
| View mode toggle | `useViewMode` |
| Dark mode | `useTheme` |
| Single resource fetch | `useResource` |
| API error handling | `useApiError` |
| Form validation | `useForm` |
| Image upload | `useImageUpload` |
| File download | `useFileDownload` |
| Page pagination | `usePagination` |
| Infinite scroll | `useInfiniteScroll` |
| Three.js scene | `useThreeScene` |
| Panorama loading | `usePanoramaLoader` |
| Editor interaction | `useEditorInteraction` |

### Never Reimplement

- URL concatenation → `useImagePath`
- Date formatting → `useDateTime`
- `window.confirm()` → `useConfirm`
- Raw error handling → `useApiError`
- Manual form state → `useForm`
- File size math → `useFileSize`
