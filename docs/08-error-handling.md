# Error Handling

This document defines the standard patterns for error handling in the Owlaround platform.

## Table of Contents

- [Backend Errors](#backend-errors)
- [Frontend Error Handling](#frontend-error-handling)
- [User-Friendly Messages](#user-friendly-messages)
- [Error Recovery](#error-recovery)

---

## Backend Errors

### HTTP Status Codes

| Status | Meaning | When Used |
|--------|---------|-----------|
| **200** | OK | Successful GET, PUT, PATCH |
| **201** | Created | Successful POST (resource created) |
| **204** | No Content | Successful DELETE |
| **400** | Bad Request | Malformed request |
| **401** | Unauthorized | Not authenticated |
| **403** | Forbidden | Not authorized (policy denied) |
| **404** | Not Found | Resource doesn't exist |
| **422** | Unprocessable Entity | Validation failed |
| **429** | Too Many Requests | Rate limited |
| **500** | Server Error | Unexpected error |

### Validation Errors (422)

Laravel returns validation errors in this format:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "name": [
      "The name field is required.",
      "The name must be at least 3 characters."
    ],
    "email": [
      "The email must be a valid email address."
    ]
  }
}
```

### Authorization Errors (403)

Policy denials return:

```json
{
  "message": "This action is unauthorized."
}
```

### Not Found Errors (404)

Route model binding failures return:

```json
{
  "message": "No query results for model [App\\Models\\Project]."
}
```

### Server Errors (500)

In production, generic message:

```json
{
  "message": "Server Error"
}
```

---

## Frontend Error Handling

### Basic Try-Catch Pattern

Always wrap API calls in try-catch:

```javascript
const loadProject = async () => {
  try {
    loading.value = true
    const response = await owl.projects.get(slug)
    project.value = response
  } catch (error) {
    console.error('Failed to load project:', error)
  } finally {
    loading.value = false
  }
}
```

### With useApiError Composable

**CRITICAL: Always use `useApiError` for consistent error handling.**

```javascript
import { useApiError } from '@/composables'

const { handleError, isValidationError, getValidationErrors } = useApiError()

const deleteProject = async () => {
  try {
    await owl.projects.delete(project.value.slug)
    router.push('/dashboard')
  } catch (error) {
    handleError(error, {
      context: 'Deleting project',
      showToast: true,
    })
  }
}
```

### handleError Options

```javascript
handleError(error, {
  context: 'Operation name',  // Logged to console
  showToast: true,            // Show toast notification
  onRetry: () => retry(),     // Add retry button to toast
})
```

### Error Type Detection

```javascript
const { isNetworkError, isValidationError, isAuthError } = useApiError()

try {
  await owl.projects.create(data)
} catch (error) {
  if (isValidationError(error)) {
    // Handle 422 - show field errors
    formErrors.value = getValidationErrors(error)
  } else if (isAuthError(error)) {
    // Handle 401/403 - redirect to login or show access denied
    router.push('/login')
  } else if (isNetworkError(error)) {
    // Handle network errors - show retry option
    showRetryDialog()
  } else {
    // Handle other errors
    handleError(error, { showToast: true })
  }
}
```

### Validation Error Handling

```javascript
import { useApiError } from '@/composables'

const { isValidationError, getValidationErrors, handleError } = useApiError()

const formErrors = ref({})

const submitForm = async () => {
  try {
    formErrors.value = {}  // Clear previous errors
    await owl.projects.create(form.value)
    emit('saved')
  } catch (error) {
    if (isValidationError(error)) {
      // Set errors to display under form fields
      formErrors.value = getValidationErrors(error)
    } else {
      handleError(error, { showToast: true })
    }
  }
}
```

Template:

```vue
<template>
  <div class="space-y-2">
    <Label for="name">Nom</Label>
    <Input
      id="name"
      v-model="form.name"
      :class="{ 'border-destructive': formErrors.name }"
    />
    <p v-if="formErrors.name" class="text-sm text-destructive">
      {{ formErrors.name[0] }}
    </p>
  </div>
</template>
```

### Retry Logic

```javascript
import { useApiError } from '@/composables'

const { withRetry, handleError } = useApiError()

const loadWithRetry = async () => {
  try {
    loading.value = true
    const response = await withRetry(
      () => owl.projects.get(slug),
      {
        maxRetries: 3,
        backoff: true,  // Exponential: 1s, 2s, 4s
        retryCondition: (error) => {
          // Only retry network errors, not 404s
          return isNetworkError(error)
        },
      }
    )
    project.value = response
  } catch (error) {
    // All retries exhausted
    handleError(error, {
      showToast: true,
      onRetry: () => loadWithRetry(),
    })
  } finally {
    loading.value = false
  }
}
```

---

## User-Friendly Messages

### Error Message Mapping

The `useApiError` composable maps errors to French messages:

| Error Type | Message |
|------------|---------|
| Network error | "Erreur de connexion. Vérifiez votre connexion internet." |
| 401 Unauthorized | "Vous devez vous connecter pour accéder à cette ressource." |
| 403 Forbidden | "Vous n'avez pas les droits nécessaires." |
| 404 Not Found | "Ressource introuvable." |
| 422 Validation | First validation error message |
| 429 Rate Limited | "Trop de requêtes. Veuillez patienter." |
| 500 Server Error | "Une erreur serveur est survenue." |
| Default | "Une erreur est survenue." |

### Custom Error Messages

```javascript
const getErrorMessage = (error) => {
  // Custom mapping for specific cases
  if (error.response?.status === 404) {
    return 'Ce projet n\'existe pas ou a été supprimé.'
  }

  // Fall back to useApiError
  return useApiError().getErrorMessage(error)
}
```

### Toast Notifications

```javascript
import { useApiError } from '@/composables'

const { handleError } = useApiError()

// Error toast (automatic with handleError)
handleError(error, { showToast: true })

// Success toast (manual)
import { toast } from '@/components/ui/toast'

toast({
  title: 'Succès',
  description: 'Le projet a été créé.',
})

// With action button
toast({
  variant: 'destructive',
  title: 'Erreur',
  description: 'La suppression a échoué.',
  action: {
    label: 'Réessayer',
    onClick: () => retryDelete(),
  },
})
```

---

## Error Recovery

### Optimistic Updates with Rollback

```javascript
const togglePublic = async () => {
  // Save previous state
  const previousValue = project.value.is_public

  // Optimistic update
  project.value.is_public = !previousValue

  try {
    await owl.projects.makePublic(project.value.slug, {
      is_public: project.value.is_public,
    })
  } catch (error) {
    // Rollback on failure
    project.value.is_public = previousValue
    handleError(error, { showToast: true })
  }
}
```

### Retry with User Confirmation

```javascript
import { useConfirm, useApiError } from '@/composables'

const { confirm } = useConfirm()
const { handleError } = useApiError()

const uploadWithRetry = async (file) => {
  let attempts = 0
  const maxAttempts = 3

  while (attempts < maxAttempts) {
    try {
      await owl.images.upload(sceneSlug, file)
      return true
    } catch (error) {
      attempts++

      if (attempts >= maxAttempts) {
        handleError(error, { showToast: true })
        return false
      }

      const retry = await confirm({
        title: 'Échec de l\'upload',
        message: `Tentative ${attempts}/${maxAttempts} échouée. Réessayer ?`,
        confirmText: 'Réessayer',
        cancelText: 'Annuler',
      })

      if (!retry) return false
    }
  }
}
```

### Graceful Degradation

```javascript
const loadProject = async () => {
  try {
    const response = await owl.projects.get(slug)
    project.value = response
  } catch (error) {
    if (error.response?.status === 404) {
      // Show not found state
      notFound.value = true
    } else if (error.response?.status === 403) {
      // Show access denied state
      accessDenied.value = true
    } else {
      // Show generic error with retry option
      loadError.value = true
    }
  }
}
```

Template:

```vue
<template>
  <LoadingSpinner v-if="loading" />

  <EmptyState
    v-else-if="notFound"
    title="Projet introuvable"
    description="Ce projet n'existe pas ou a été supprimé."
  >
    <Button @click="router.push('/dashboard')">
      Retour au tableau de bord
    </Button>
  </EmptyState>

  <EmptyState
    v-else-if="accessDenied"
    title="Accès refusé"
    description="Vous n'avez pas les droits pour accéder à ce projet."
  >
    <Button @click="router.push('/dashboard')">
      Retour au tableau de bord
    </Button>
  </EmptyState>

  <EmptyState
    v-else-if="loadError"
    title="Erreur de chargement"
    description="Impossible de charger le projet."
  >
    <Button @click="loadProject">
      <RefreshCcw class="mr-2 h-4 w-4" />
      Réessayer
    </Button>
  </EmptyState>

  <ProjectContent v-else :project="project" />
</template>
```

### Form Error Recovery

```javascript
const saveForm = async () => {
  // Clear previous errors
  formErrors.value = {}
  serverError.value = null

  try {
    saving.value = true
    await owl.projects.update(project.slug, form.value)
    emit('saved')
  } catch (error) {
    if (isValidationError(error)) {
      // Show field-level errors
      formErrors.value = getValidationErrors(error)
    } else {
      // Show form-level error
      serverError.value = getErrorMessage(error)
    }
  } finally {
    saving.value = false
  }
}
```

Template:

```vue
<template>
  <form @submit.prevent="saveForm">
    <!-- Form-level error -->
    <Alert v-if="serverError" variant="destructive" class="mb-4">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Erreur</AlertTitle>
      <AlertDescription>{{ serverError }}</AlertDescription>
    </Alert>

    <!-- Form fields with individual errors -->
    <div class="space-y-4">
      <!-- ... fields ... -->
    </div>

    <Button type="submit" :disabled="saving">
      {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
    </Button>
  </form>
</template>
```

---

## Error Logging

### Console Logging

```javascript
// Always log errors to console for debugging
try {
  await owl.projects.delete(slug)
} catch (error) {
  console.error('[DeleteProject]', error)
  handleError(error, { showToast: true })
}
```

### Structured Logging

```javascript
const { handleError } = useApiError()

// handleError automatically logs with context
handleError(error, {
  context: 'DeleteProject',  // Logged as: [DeleteProject] Error: ...
  showToast: true,
})
```

---

## Quick Reference

### Error Handling Checklist

- [ ] Wrap all API calls in try-catch
- [ ] Use `useApiError` for consistent handling
- [ ] Show user-friendly messages (not raw errors)
- [ ] Log errors to console for debugging
- [ ] Handle loading states during async operations
- [ ] Provide retry options for transient failures
- [ ] Show validation errors under form fields
- [ ] Handle 401/403/404 with appropriate UI states
- [ ] Use optimistic updates with rollback for better UX

### Decision Tree

```
API Call Failed
     │
     ├─► 401 Unauthorized
     │   └─► Redirect to login
     │
     ├─► 403 Forbidden
     │   └─► Show access denied UI
     │
     ├─► 404 Not Found
     │   └─► Show not found UI
     │
     ├─► 422 Validation
     │   └─► Show field errors
     │
     ├─► Network Error
     │   └─► Show retry option
     │
     └─► Other Errors
         └─► Show toast + log
```

### Never Do

- Never show raw error messages to users
- Never swallow errors silently (always log)
- Never use `window.alert()` for errors
- Never reimplement error handling logic
- Never forget loading states
